import boto3, os

def upload_to_s3(image_byte_data, image_name):
    image_byte_data.seek(0)
    s3 = boto3.client('s3', aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    try:
        s3.upload_fileobj(image_byte_data, 'rofbusinesstestbucket', image_name)
        return f"https://rofbusinesstestbucket.s3.eu-central-1.amazonaws.com/{image_name}"
    except:
        return None
