var AWS = require("aws-sdk");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended : true}))

let awsConfig = {
    "region": "us-east-2",
    "endpoint": "http://dynamodb.us-east-2.amazonaws.com",
    "accessKeyId": "AKIAZGJVKBIKLE6HJKFF", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/home.html');
})
app.get('/save', (req,res)=>{
    res.sendFile(__dirname + '/form.html');
})
app.get('/delete', (req,res)=>{
    res.sendFile(__dirname + '/delete.html');
})
app.get('/All', (req,res)=>{
    res.sendFile(__dirname + '/table/htmltable.html');
})
let save = function () {
    app.post('/save', async(req,res)=>{
        try{
            const input = await{
                "users": req.body.Name, 
                "Email": req.body.Email,
                "Age": req.body.Age,
                "Gender": req.body.Gender,
                "Work": req.body.Work
            }
            const params = {
                TableName: "Testing",
                Item: input
            };
            docClient.put(params, function (err, data) {
                
                if (err) {
                    console.log("Testing::save::error - " + JSON.stringify(err, null, 2));                      
                } else {
                    console.log("Testing::save::success");
                    res.redirect('/')            
                }
            });
        }catch(err){
            console.log({message:err});
        }
        
    });
}
let fetchOneByKey = function () {
    app.post('/read', async(req,res)=>{
        try{
            var params = {
                TableName: "Testing",
                Key: {
                    "users": req.body.search
                }
            };
            docClient.get(params, function (err, data) {
                if (err) {
                    console.log("Testing::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
                }
                else {
                    let DataAll = {};
                    console.log("Testing::fetchOneByKey::success " + JSON.stringify(data, null, 2));
                    res.sendFile(__dirname + '/table.html');
                    DataAll = {
                        Name: data.Item.users,
                        Email: data.Item.Email,
                        Age: data.Item.Age,
                        Gender: data.Item.Gender,
                        Work: data.Item.Work
                    }
                    res.send(DataAll);
                }
            })

        }catch(err){
          console.log({message:err});
        }
        
    });
    
}

let remove = function () {
    app.post('/delete', async(req,res)=>{
        try{
            var params = await{
                TableName: "Testing",
                Key: {
                    "users": req.body.search
                }
            };
            docClient.delete(params, function (err, data) {
        
                if (err) {
                    console.log("Testing::delete::error - " + JSON.stringify(err, null, 2));
                } else {
                    console.log("Testing::delete::success");  
                    res.redirect('/')
                }
            });

        }catch(err){
            
        }
    })

}

let ShowAll = function () {
    app.post('/All', async(req,res)=>{
        try{
            const scanTable = async (TableNameAll = "Testing") => {   
         
                const paramsAll = {
                    TableName: TableNameAll,
                };
        
                const scanResults = [];
                let items;
                do{
                    items =  await docClient.scan(paramsAll).promise();
                    items.Items.forEach((item) => scanResults.push(item));
                    paramsAll.ExclusiveStartKey  = items.LastEvaluatedKey;
                }while(typeof items.LastEvaluatedKey !== "undefined");

                res.redirect('/')
                //console.log(scanResults[0].users);
                console.log(scanResults);
            };
            scanTable();
        }catch(err){
            
        }
    })

}

remove();
fetchOneByKey();
save();
ShowAll();
app.listen(3000,()=>{
    console.log('Listening on http://localhost:3000');
})