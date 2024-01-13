import tensorflow as tf
from PIL import Image
import numpy as np
from io import BytesIO
import base64

def transform_image_into_tensor(image):
    image = image.convert('RGB').copy()
    image = tf.keras.utils.img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = image.astype('float32')/255
    return image

def transform_base64_into_image_and_byte_data(base64_str):
    base64_str = base64_str.split(',')[1] if ',' in base64_str else base64_str
    image_byte_data = BytesIO(base64.b64decode(base64_str))
    image = Image.open(image_byte_data)
    return(image, image_byte_data)