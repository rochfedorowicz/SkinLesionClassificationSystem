from flask import Blueprint, request, current_app, jsonify, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import sqlalchemy
import re
import os

from . import db
from .transform_handling import transform_image_into_tensor, transform_base64_into_image_and_byte_data
from .models import User, Image
from .s3_bucket_handling import upload_to_s3

endpoints = Blueprint('endpoints', __name__)
EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

def attempt_user_login(email, password):
    """
    Attempt to log in a user with the provided email and password.

    Args:
        email (str): User's email.
        password (str): User's password.

    Returns:
        tuple: A tuple containing the result ('success' or 'fail') and the reason for failure if applicable.
    """
    user = User.query.filter_by(email = email).first()
    if (user):
        if check_password_hash(user.password, password):
            result = 'success'
            reason = ''
        else:
            result = 'fail'
            reason = 'Password is incorrect!'
    else:
        result = 'fail'
        reason = 'There is no user with that email!'
    return (result, reason)

def attempt_user_sing_up(email, first_name, password, repeated_password):
    """
    Attempt to sign up a new user with the provided details.

    Args:
        email (str): User's email.
        first_name (str): User's first name.
        password (str): User's chosen password.
        repeated_password (str): Confirmation of the user's chosen password.

    Returns:
        tuple: A tuple containing the result ('success' or 'fail') and the reason for failure if applicable.
    """
    if(not re.fullmatch(EMAIL_REGEX, email)):
        result = 'fail'
        reason = 'Email address is not valid!'
    else:
        if (len(password) >= 5):
            if password == repeated_password:
                try:
                    new_user = User(email = email,
                                    first_name = first_name,
                                    password = generate_password_hash(password))
                    db.session.add(new_user)
                    db.session.commit()
                    result = 'success'
                    reason = ''
                except sqlalchemy.exc.IntegrityError:
                    result = 'fail'
                    reason = 'Mail already exists in the database!'
            else:
                result = 'fail'
                reason = 'Passwords are not identical!'
        else:
            result = 'fail'
            reason = 'Password should be at least 5 characters long!'
    return (result, reason)

def get_user_image_history(email):
    """
    Retrieve the history of images processed for a given user.

    Args:
        email (str): User's email.

    Returns:
        dict: A dictionary with image names as keys and their details (URL, prediction) as values.
    """
    user = User.query.filter_by(email = email).first()
    user_images = Image.query.filter_by(user_id = user.id)
    image_history = {}
    for image in user_images:
        image_name = image.url.split('/')[-1]
        image_history.update({image_name: {}})
        image_history.get(image_name).update({'url': image.url,
                                            'prediction': image.jsonified_prediction})
    return image_history

def predict_image(image):
    """
    Predict the classification of an image using pre-loaded machine learning models.

    This function first transforms the input image into a tensor format suitable for 
    the machine learning models. It then uses the binary and multiclass models loaded 
    into the Flask application to predict the image's classification.

    Args:
        image: An image file to be classified. The image is expected to be in a format 
               compatible with the transform_image_into_tensor function (e.g., PIL image).

    Returns:
        dict: A dictionary containing the predictions from both models. The 'binary' key 
              corresponds to the prediction from the binary model, and the 'multiclass' 
              key corresponds to the prediction from the multiclass model.
    """
    image_tensor = transform_image_into_tensor(image.copy())
    binary_prediction = current_app.available_models['binary_model'].predict(image_tensor, verbose=0)
    multiclass_prediction = current_app.available_models['multiclass_model'].predict(image_tensor, verbose=0)
    return {'binary': binary_prediction.tolist()[0], 'multiclass': multiclass_prediction.tolist()[0]}

def add_image_for_user(email, image_byte_data, predicted_values):
    """
    Add an image and its associated prediction results to the database for a specific user.

    This function uploads the provided image byte data to an S3 bucket and creates a new 
    image record in the database with the image's URL, its prediction results, and the 
    associated user's ID. The function first retrieves the user based on the provided email, 
    calculates the number of images already associated with the user to generate a unique 
    file name for the new image, and then uploads the image. After the image is successfully 
    uploaded, a new record for the image is created in the database including the URL and 
    prediction results.

    Args:
        email (str): The email address of the user to whom the image will be associated.
        image_byte_data: The byte data of the image to be uploaded.
        predicted_values: The prediction results to be associated with the image. This should be 
                          a data structure (like a dictionary or list) that can be converted to 
                          a string format.

    Returns:
        None: This function does not return a value but commits the new image record to the database.
    """
    user = User.query.filter_by(email = email).first()
    number_of_user_images = len(user.images)
    url = upload_to_s3(image_byte_data, f'user_{user.id}_image_{number_of_user_images}.jpg')
    new_image = Image(url = url,
                jsonified_prediction = predicted_values.__str__(),
                user_id = user.id)
    db.session.add(new_image)
    db.session.commit()

@endpoints.route('/', methods=['GET'])
def info():
    """
    Provide basic information about the API.

    This endpoint serves as a simple informational page for the API. When accessed 
    via a GET request, it returns a basic HTML string indicating that the server is 
    a Python back-end API built for TensorFlow operations.

    The function is attached to the root URL ('/') of the application.

    Returns:
        str: An HTML string that displays a message about the server. 
             This message is not dynamic and does not change based on any input.
    """
    return "<h1>Python back-end server API for Tensorflow.</h1>"

@endpoints.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    """
    Handle user sign-up requests for the application.

    This endpoint supports two HTTP methods: GET and POST. The GET request simply returns a basic 
    informational HTML page about the sign-up service. The POST request handles the actual user 
    sign-up process. It retrieves user details from the request form, such as email, first name, 
    password, and repeated password, and then attempts to sign up the user using these details. 
    The function relies on the 'attempt_user_sign_up' function to process the sign-up logic and 
    returns a JSON response with the result ('success' or 'fail') and the reason for failure, if any.

    Returns:
        For GET requests:
            str: An HTML string indicating the sign-up service.
        For POST requests:
            flask.Response: A JSON response containing the result of the sign-up attempt 
                            ('success' or 'fail') and the reason for the result.
    """
    if request.method == 'GET':
        return "<h1>Python back-end server API for Tensorflow. Sign up service.</h1>"    
    elif request.method == 'POST':
        email = request.form.get('email')
        first_name = request.form.get('firstName')
        password = request.form.get('password')
        repeated_password = request.form.get('repeatedPassword')

        sing_up_response = attempt_user_sing_up(email, first_name, password, repeated_password)
        return jsonify({'result': sing_up_response[0], 'reason': sing_up_response[1]})

@endpoints.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handle user login requests for the application.

    This endpoint supports two HTTP methods: GET and POST. The GET request simply returns a basic 
    informational HTML page about the login service. The POST request handles the actual user login 
    process. It retrieves the user's email and password from the request form and then attempts to 
    log in the user using these credentials. The function relies on the 'attempt_user_login' function 
    to process the login logic and returns a JSON response with the result ('success' or 'fail') and 
    the reason for failure, if any.

    Returns:
        For GET requests:
            str: An HTML string indicating the login service.
        For POST requests:
            flask.Response: A JSON response containing the result of the login attempt ('success' or 
                            'fail') and the reason for the result.
    """
    if request.method == 'GET':
        return "<h1>Python back-end server API for Tensorflow. Login service.</h1>"    
    elif request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        login_response = attempt_user_login(email, password)
        return jsonify({'result': login_response[0], 'reason': login_response[1]})

@endpoints.route('/predict', methods=['GET', 'POST'])
def predict_photo():
    """
    Handle image prediction requests for the application.

    This endpoint supports two HTTP methods: GET and POST. The GET request simply returns a basic
    informational HTML page about the image prediction service. The POST request handles the image
    prediction process. It first authenticates the user using their email and password. If the
    authentication is successful, the function proceeds to process the image sent in the request
    (encoded as a base64 string), predicts its classification using pre-loaded models, and saves
    the image and prediction results for the user. The function uses 'predict_image' for making
    predictions and 'add_image_for_user' for saving the image and prediction results. If
    authentication fails, no prediction is made.

    Returns:
        For GET requests:
            str: An HTML string indicating the prediction service.
        For POST requests:
            flask.Response: A JSON response containing the result of the authentication ('success' or
            'fail') and the prediction results (empty if authentication fails).
    """
    if request.method == 'GET':
        return "<h1>Python back-end server API for Tensorflow. Prediction service.</h1>"    
    elif request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        login_response = attempt_user_login(email, password)
        if login_response[0] == 'success':
            base64_str = request.form.get('base64')
            image, image_byte_data = transform_base64_into_image_and_byte_data(base64_str)
            predicted_values = predict_image(image)
            add_image_for_user(email, image_byte_data, predicted_values)
        else:
            predicted_values = {}
        result = login_response[0]
        return jsonify({'result': result, 'prediction': predicted_values})

@endpoints.route('/history', methods=['GET', 'POST'])
def history():
    """
    Handle requests to retrieve a user's image processing history.

    This endpoint supports two HTTP methods: GET and POST. The GET request simply returns a basic 
    informational HTML page about the history service. The POST request processes requests for a 
    user's history of processed images. It first authenticates the user using their email and 
    password. If authentication is successful, it retrieves the user's image processing history 
    using the 'get_user_image_history' function, which returns a list of images along with their 
    associated details and predictions. If the authentication fails, an empty history is returned.

    Returns:
        For GET requests:
            str: An HTML string indicating the history service.
        For POST requests:
            flask.Response: A JSON response containing the result of the authentication ('success' or 
                            'fail') and the user's image history (empty if authentication fails).
    """
    if request.method == 'GET':
        return "<h1>Python back-end server API for Tensorflow. History service.</h1>"    
    elif request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        login_response = attempt_user_login(email, password)
        if login_response[0] == 'success':
            image_history = get_user_image_history(email)
        else:
            image_history = {}
        result = login_response[0]
        return jsonify({'result': result, 'images': image_history})
