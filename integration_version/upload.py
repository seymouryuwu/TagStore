import json
import base64
import boto3
import random

s3 = boto3.client("s3")

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST' :
        data = json.loads(event['body'])
        name = data['name']
        random_number = '{:016}'.format(random.randrange(1, 10**16))
        image_name = random_number + name

        image_data = data['image'].encode('utf-8')
        image = base64.b64decode(image_data)
        
        s3_upload = s3.put_object(Bucket="s3fit5225", Key=image_name, Body=image, ACL='public-read')
    
    return {
        'statusCode': 200,
        'body': json.dumps("Upload successfully."),
        'headers': {
            "Content-Type" : "application/json",
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : "true",
            "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
        }
    }