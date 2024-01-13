from flask import Flask
import tensorflow as tf
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = os.environ['SESKEY']
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    from .enpoints import endpoints
    app.register_blueprint(endpoints, url_prefix='/')

    create_database(app)

    available_models = {}
    available_models['binary_model'] = tf.keras.models.load_model(os.getcwd() + '/models/model1_3')
    tf.keras.backend.clear_session()
    available_models['multiclass_model'] = tf.keras.models.load_model(os.getcwd() + '/models/model4_3')
    tf.keras.backend.clear_session()
    app.available_models = available_models
    for model in app.available_models:
        app.available_models[model].summary()

    return app

def create_database(app):
    from .models import User, Image
    with app.app_context():
        if not os.path.exists('website/' + DB_NAME):
            db.create_all()
