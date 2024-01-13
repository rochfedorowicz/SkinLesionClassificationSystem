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
    image_tensor = transform_image_into_tensor(image.copy())
    binary_prediction = current_app.available_models['binary_model'].predict(image_tensor, verbose=0)
    multiclass_prediction = current_app.available_models['multiclass_model'].predict(image_tensor, verbose=0)
    return {'binary': binary_prediction.tolist()[0], 'multiclass': multiclass_prediction.tolist()[0]}

def add_image_for_user(email, image_byte_data, predicted_values):
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
    return "<h1>Python back-end server API for Tensorflow.</h1>"

@endpoints.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
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
    if request.method == 'GET':
        return "<h1>Python back-end server API for Tensorflow. Login service.</h1>"    
    elif request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        login_response = attempt_user_login(email, password)
        return jsonify({'result': login_response[0], 'reason': login_response[1]})

@endpoints.route('/predict', methods=['GET', 'POST'])
def predict_photo():
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
