import json
import base64
import boto3

s3 = boto3.client("s3")

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST' :
        data = json.loads(event['body'])
        name = data['name']

        image_data = data['image'].encode('utf-8')
        image = base64.b64decode(image_data)
        
        s3_upload = s3.put_object(Bucket="fit5225assignment2", Key=name, Body=image)
    
    return {
        'statusCode': 200,
        'body': json.dumps("Upload successfully.")
    }

