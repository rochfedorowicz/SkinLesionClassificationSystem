from flask import Flask
import tensorflow as tf
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    """
    Create and configure an instance of the Flask application.

    This function sets up the Flask application with necessary configurations,
    initializes the database, and loads machine learning models using TensorFlow.
    It also sets up CORS (Cross-Origin Resource Sharing) for the application.

    Returns:
        Flask: A Flask application instance with registered endpoints, database,
               and machine learning models.

    Environment Variables:
        TF_CPP_MIN_LOG_LEVEL: TensorFlow logging level (set to '3' to suppress logs).
        SESKEY: Secret key for the Flask application.
    """
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = os.environ['SESKEY']
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    from .endpoints import endpoints
    app.register_blueprint(endpoints, url_prefix='/')

    create_database(app)

    available_models = {}
    available_models['binary_model'] = tf.keras.models.load_model(os.getcwd() + '/models/model_bin')
    tf.keras.backend.clear_session()
    available_models['multiclass_model'] = tf.keras.models.load_model(os.getcwd() + '/models/model_mul')
    tf.keras.backend.clear_session()
    app.available_models = available_models
    for model in app.available_models:
        app.available_models[model].summary()

    return app

def create_database(app):
    """
    Create the database for the Flask application.

    This function is called during the application setup to create the database
    if it does not already exist. It uses SQLAlchemy to interact with the database.

    Args:
        app (Flask): The Flask application instance for which the database is created.
    """
    from .models import User, Image
    with app.app_context():
        if not os.path.exists('website/' + DB_NAME):
            db.create_all()
