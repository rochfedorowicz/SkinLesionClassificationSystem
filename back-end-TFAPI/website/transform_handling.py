import tensorflow as tf
from PIL import Image
import numpy as np
from io import BytesIO
import base64

def transform_image_into_tensor(image):
    """
    Transform an image into a tensor suitable for model prediction.

    This function takes an image as input and performs several transformations to convert it into 
    a format suitable for prediction by machine learning models.

    Args:
        image: An image object, typically in the PIL (Pillow) format.

    Returns:
        numpy.ndarray: A NumPy array representing the image in tensor format. The array has the 
                    shape (1, height, width, channels) and is of data type 'float32' with values 
                    normalized to the range [0, 1].
    """
    image = image.convert('RGB').copy()
    image = tf.keras.utils.img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = image.astype('float32')/255
    return image

def transform_base64_into_image_and_byte_data(base64_str):
    """
    Transform a base64-encoded image string into an image object and byte data.

    This function takes a base64-encoded image string as input, decodes it, and converts it into 
    both an image object (typically in the PIL format) and byte data.

    Args:
        base64_str (str): The base64-encoded image string.

    Returns:
        tuple: A tuple containing two elements:
            - image: An image object created from the decoded base64 data, typically in the PIL (Pillow) format.
            - image_byte_data: Byte data of the image, suitable for further processing or storage.
    """
    base64_str = base64_str.split(',')[1] if ',' in base64_str else base64_str
    image_byte_data = BytesIO(base64.b64decode(base64_str))
    image = Image.open(image_byte_data)
    return(image, image_byte_data)