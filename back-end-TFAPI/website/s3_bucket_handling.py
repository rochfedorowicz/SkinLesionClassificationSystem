import boto3, os

def upload_to_s3(image_byte_data, image_name):
    """
    Upload an image byte data to an Amazon S3 bucket and return the URL.

    This function uploads the provided image byte data to an Amazon S3 bucket. It requires the 
    'boto3' library to interact with AWS S3 and expects the AWS access key and secret access 
    key to be available in the environment variables as 'AWS_ACCESS_KEY' and 'AWS_SECRET_ACCESS_KEY'.

    Args:
        image_byte_data: The byte data of the image to be uploaded.
        image_name (str): The name to be assigned to the image file when stored in the S3 bucket.

    Returns:
        str or None: If the upload is successful, it returns the URL of the uploaded image. If 
                    there's any error during the upload, it returns None.
    """
    image_byte_data.seek(0)
    s3 = boto3.client('s3', aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    try:
        s3.upload_fileobj(image_byte_data, 'rofbusinesstestbucket', image_name)
        return f"https://rofbusinesstestbucket.s3.eu-central-1.amazonaws.com/{image_name}"
    except:
        return None
