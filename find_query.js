const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
exports.handler = async(event, context, callback) => {
 console.log('remaining time =', context.getRemainingTimeInMillis());
 console.log('functionName =', context.functionName);
 console.log('AWSrequestID =', context.awsRequestId);
 let body;
 let statusCode = '200';
 const headers = { 'Content-Type': 'application/json', };
 const tableName = 'Image_URL';
 
 //switching based on events get and post
 
 try {
  switch (event.httpMethod) {
   case 'GET':{
    if (event.pathParameters) {
     //below block is for path parameters
     
     const url = event.pathParameters.url;
     console.log(event.pathParameters.url);
     let params = { TableName: tableName, FilterExpression: 'contains (tag, :url)', ExpressionAttributeValues: { ":url": url }, };
     body = await dynamo.scan(params).promise();
     const items = body.Items;
     const urls = [];
     //Just picking id's from each key:value pair and storing it in urls array
     items.map(function(item) {
      urls.push(item.id)
    });
    //returning a json object
    body = JSON.stringify({ "links": urls });
    return { body };
    }
    //block for query string parameters
    else if (event.queryStringParameters){
     var data=[];
     const query = event.queryStringParameters;
     const tags =[];
     for (var key in query){
      tags.push(query[key]);
     }
     
     //iterating through the JSON object
     
     
     

     var tagObject = {};
     var filterexpr=[];
     var index = 0;
     tags.forEach(function(value) {
      index++;
       var tagKey = ":tag"+index;
       tagObject[tagKey.toString()] = value;
       filterexpr.push('contains (tag,'+tagKey+')');
    });
    console.log("values",tagObject);
    console.log("filter",filterexpr);
    console.log("chekcing",filterexpr.join(' and '))


// var params = {
//     TableName : tableName,
//     FilterExpression : "tag contains ("+Object.keys(titleObject).toString()+ ")",
//     ExpressionAttributeValues : titleObject
// };

     
      let params = { TableName: tableName, FilterExpression: filterexpr.join(' and '), ExpressionAttributeValues: tagObject, };
      //data[i] = await dynamo.scan(params).promise();
      body = await dynamo.scan(params).promise();
      console.log("first",body);
    
     
    const urls=[];

    data.forEach(function(response) {
     for (var i = 0; i < response.Items.length; i++) {
      console.log("macho",response.Items[i].id);
      if (!urls.includes(response.Items[i].id)){
          urls.push(response.Items[i].id)
      }
     }
    })
    
    body = JSON.stringify({ "links": body });
    return { body };
    }
    
    else {
     
    body = await dynamo.scan({ TableName: tableName }).promise();
    const items = body.Items;
    const urls = [];
    items.map(function(item) {
     urls.push(item.id)
    });
    body = JSON.stringify({ "links": urls });
    return { body };
    }
  }
  
   case 'POST': {
   
    const tags = JSON.parse(event.body).tags;
    var tagObject = {};
     var filterexpr=[];
     var index = 0;
     tags.forEach(function(value) {
      index++;
       var tagKey = ":tag"+index;
       tagObject[tagKey.toString()] = value;
       filterexpr.push('contains (tag,'+tagKey+')');
    });
    let params = { TableName: tableName, FilterExpression: filterexpr.join(' and '), ExpressionAttributeValues: tagObject, };
    body = await dynamo.scan(params).promise();
    
    // for (var i = 0; i < tags.length; i++) {
    //  let params = { TableName: tableName, FilterExpression: 'contains (tag, :tag)', ExpressionAttributeValues: { ":tag": tags[i] }, };
    //  data[i] = await dynamo.scan(params).promise();
    //  body = await dynamo.scan(params).promise();
    // }
   const urls = [];


 
     for (var i = 0; i < body.Items.length; i++) {
      console.log(urls);
      if (!urls.includes(body.Items[i].id)){
          urls.push(body.Items[i].id)
      }
     }
   
   
    return { body:JSON.stringify({ "links": urls }) };
   }
  }
 }
 catch (err) {
  statusCode = '400';
  body = err.message;
 }

};
