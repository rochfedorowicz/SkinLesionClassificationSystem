from . import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(150), unique = True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    images = db.relationship('Image')

class Image(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    url = db.Column(db.String(10000))
    jsonified_prediction = db.Column(db.String(10000))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))