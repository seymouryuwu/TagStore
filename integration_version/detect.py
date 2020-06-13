import json
import boto3
import base64
import cv2
import numpy as np
import os

def lambda_handler(event, context):
    s3 = boto3.client("s3")
    dynamodb = boto3.client("dynamodb")
    
    if event:
        file_obj = event['Records'][0]
        file_name = str(file_obj['s3']['object']['key'])
        file_url = "http://s3fit5225.s3.amazonaws.com/" + file_name
        
        coco_names = s3.get_object(Bucket = "s3fit5225", Key = "coco.names")
        coco_names_iterator = coco_names['Body'].iter_lines()
        classes = []
        while True:
            try:
                classes.append(str(next(coco_names_iterator), 'utf-8'))
            except StopIteration:
                break
        
        s3.download_file(Bucket = "s3fit5225", Key = "yolov3-tiny.weights", Filename="/tmp/yolov3.weights")
        s3.download_file(Bucket = "s3fit5225", Key = "yolov3-tiny.cfg", Filename="/tmp/yolov3.cfg")
        
        image_obj = s3.get_object(Bucket = "s3fit5225", Key = file_name)
        image_content = image_obj['Body'].read()
        np_array = np.fromstring(image_content, np.uint8)
        image_np = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        net = cv2.dnn.readNetFromDarknet("/tmp/yolov3.cfg", "/tmp/yolov3.weights")
        blob = cv2.dnn.blobFromImage(image_np, 1/255.0, (416, 416), (0,0,0), swapRB=True, crop=False) 
        net.setInput(blob)

        layer_names = net.getLayerNames()
        output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
        layerOutputs = net.forward(output_layers)

        tags = []
        for output in layerOutputs:
            for detection in output:
                scores = detection[5:]
                classID = np.argmax(scores)
                label = str(classes[classID])
                confidence = scores[classID]
                tag = {'S': label} 
                if confidence > 0.5 and tag not in tags:
                    tags.append(tag)
                    
        dynamodb.put_item(
            TableName="fit5225", 
            Item={
                'id': {
                    'S': file_url,
                }, 
                'tag': {
                    'L': tags,
                },
            },
        )
        
    
    return {
        'statusCode': 200,
        'body': json.dumps('Detect object and store tags successfully.')
    }
