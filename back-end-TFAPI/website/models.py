from . import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    """
    A database model representing a user in the system.

    This class defines the structure of the 'User' table in the database. It inherits from 
    'db.Model' provided by SQLAlchemy and 'UserMixin' for user session management. The model 
    includes several fields: id, email, password, first_name, and images. Each field is 
    mapped to a column in the database table.

    Attributes:
        id (int): A unique identifier for each user, serving as the primary key.
        email (str): The user's email address. It is set to be unique, ensuring no two users 
                    can share the same email.
        password (str): The user's hashed password.
        first_name (str): The user's first name.
        images (SQLAlchemy relationship): A relationship to the 'Image' model. This represents 
                                        a one-to-many relationship, indicating that a single 
                                        user can be associated with multiple images.
    """
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(150), unique = True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    images = db.relationship('Image')

class Image(db.Model):
    """
    A database model representing an image and its associated data in the system.

    This class defines the structure of the 'Image' table in the database, inheriting from 'db.Model' 
    provided by SQLAlchemy. The model includes several fields: id, url, jsonified_prediction, and 
    user_id, each corresponding to a column in the database table.

    Attributes:
        id (int): A unique identifier for each image, serving as the primary key.
        url (str): The URL where the image is stored, typically pointing to a location in an S3 bucket 
        storage service. The string length is set to accommodate very long URLs.
        jsonified_prediction (str): A string representation of the prediction results associated with 
                                    the image.
        user_id (int): A foreign key linking the image to a user in the 'User' table. This establishes 
                    a many-to-one relationship, indicating that each image is associated with one user.
    """
    id = db.Column(db.Integer, primary_key = True)
    url = db.Column(db.String(10000))
    jsonified_prediction = db.Column(db.String(10000))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))