var express = require("express");         //for creating api's using EXPRESS
var app = express();                        //Initializing name called app to use all express module functions

const bodyParser = require('body-parser');   //for post,put,delete methods we require body-parser
app.use(bodyParser.urlencoded({ extended: true }));        //It parses the url and check if content type matches the header or not
app.use(bodyParser.json());                 //returns a middleware that parses json objects

const server = require('./server');            
const middleware = require("./middleware");         //connecting server file for awt

const MongoClient = require('mongodb').MongoClient;         //For connecting to database we require module called "mongodb"
const url = 'mongodb://localhost:27017';            //Passing the default portnumber as url for connection
const dbName = 'hospitalManagementSystem';          //dbName is the name of the DATABASE
let db;                                             //declaring a variable db which is empty
MongoClient.connect(url, (err, client) => {     //trying to connect with the given url
    if (err) return console.log(err);           //If error occurs we are displaying error
    db = client.db(dbName);                     //if no error we initialize db with name of the database we want to use
    console.log(`Connected Database: ${url}`);      //Displaying URl in console if connection is successfull
    console.log(`Database: ${dbName}`);         //Similarly displaying name of the database in console
});

app.listen(8080);                   //giving a specific port number on which the program can run here port Number is"8080"

//Main Page 
app.get('/',middleware.checkToken, function (req, res) {          
    res.writeHead(200, { 'Content-Type': 'text/html' });        //Setting Content-Type and sending http status as 200
    console.log("Welcome to Hospital Management!");            
    res.write("<div class='container' style='text-align:center'>");         //HTML 
    res.write("<h1 style='color:darkorange'>Welcome to Hospital Management System!</h1></div>");//HTML
    res.end();//ending the response
});

//Hospital Details
app.get('/hospitaldetails',middleware.checkToken, function (req, res) {               //"/hospitaldetails url"
    console.log("Fetching data from Hospital Details Collection...");     
    db.collection('hospitalDetails', function (err, collection) {   //in collection hospitalDetails we check
        collection.find().toArray(function (err, items) {       //We are finding the data and converting in array
            if (err) throw err;             //if aany error ocuured displaying error
            console.log("Displaying Hospital Details....")      //if no error
            res.send(items);            //we are sending data
            res.end();          //and ending the response
        });
    });
});

//Ventillator Details
app.get('/ventillatordetails',middleware.checkToken, function (req, res) {                //Similarly to above one
    console.log("Fetching data from Ventillators Details Collection...");
    db.collection('ventillatorDetails', function (err, collection) {
        collection.find().toArray(function (err, items) {
            if (err) throw err;
            console.log("Displaying ventillator details....");
            res.send(items);
            res.end();
        });
    });
});

//Hospital Names
app.get('/hospitaldetails/hospitalnames',middleware.checkToken, function (req, res) {
    let hospitalName = req.query.name;                  //here we take name of hospital from user in form of query and store it in hospitalName
    console.log("Fetching hospital names from Hospital Details Collection...");
    db.collection('hospitalDetails', function (err, collection) {      
        collection.find({ name: hospitalName }).toArray(function (err, items) {      //Check if the name is present in collection"hospitalDetails"
            if (err) throw err;         //If any error occurs display the error
            console.log("Displaying Hospital Names....");       
            res.send(items);            //or display the given hospital name details
            res.end();                  //and end the response
        });
    });
});

//ventillator status
app.get('/ventillatordetails/ventillatorstatus',middleware.checkToken, function (req, res) {
    console.log("Fetching ventillator Details from Ventillators Details Collection...");    //Similar to above one
    let ventillatorStatus = req.query.status;
    var ventillatorDetails = db.collection('ventillatorDetails')
        .find({ "status": ventillatorStatus }).toArray().then(result => res.json(result));
});

//Ventillator Details by Hospital Name
app.get('/ventillatordetails/hospitalname',middleware.checkToken, function (req, res) {
    console.log("Fetching ventillator Details from Ventillators Details Collection...");//Similar to above one
    let hospitalName = req.query.name;
    db.collection('ventillatorDetails', function (err, collection) {
        collection.find({ name: hospitalName }).toArray(function (err, items) {
            if (err) throw err;
            console.log("Displaying ventillator Details.....")
            res.send(items);
            res.end();
        });
    });
});

//SearchByName
app.get('/searchbyname',middleware.checkToken, function (req, res) {      
    let name = req.query.name;
    console.log(name);
    var q = { name: new RegExp(req.query.name, 'i') };          //here we use regular expression for case-sensitivity 
    db.collection('ventillatorDetails', function (err, collection) {
        collection.find(q).toArray(function (err, items) {
            if (err) throw err;
            console.log("Displaying...");
            res.send(items);
            res.end();
        });
    });
});

//SearchByStatus
app.get('/searchbystatus',middleware.checkToken, function (req, res) {
    let status = req.query.status;
    console.log(status);
    var q = { status: new RegExp(req.query.status, 'i') };     //here we use regular expression for case-sensitivity 
    db.collection('ventillatorDetails', function (err, collection) {
        collection.find(q).toArray(function (err, items) {
            if (err) throw err;
            console.log("Displaying...");
            res.send(items);
            res.end();
        });
    });
});

//Add ventillator
//put , post ,delete is used for mor security whereas get is less secure and can be used in retrieving data
app.post('/ventillatordetails/addventillator',middleware.checkToken, function (req, res) {             //put method is used for adding data to database 
    console.log("Fetching ventillator Details from Ventillators Details Collection...");
    let hospitalName = req.body.name;           //getting the details from user
    let hospitalId = req.body.hId;
    let ventillatorId = req.body.vId;
    let ventillatorStatus = "available";
    db.collection('ventillatorDetails', function (err, collection) {//inserting details entered by user
        collection.insert({ "hId": hospitalId, "vId": ventillatorId, "status": ventillatorStatus, "name": hospitalName, }, (err, items) => {
            if (err) throw err;      //if error displaying error
            console.log(items);
            res.send("Successfully Added"); //if no error adding data to database and give confirmation
            res.end();          //ending the response
        });
    });
});

//Remove Ventillator
app.delete('/ventillatordetails/removeventillator',middleware.checkToken, function (req, res) {       //put method is used for adding data to database
    console.log("Fetching ventillator Details from Ventillators Details Collection...");
    let hospitalId = req.body.hId;          //getting the details from user for removing data
    let ventillatorId = req.body.vId;
    db.collection('ventillatorDetails', function (err, collection) {
        collection.remove({ "hId": hospitalId, "vId": ventillatorId }, (err, items) => { //remove method is used for removing 
            if (err) throw err;             //if error displaying error
            console.log(items);
            res.write("Successfully Removed")   //if no error deleting data from database and give confirmation
            res.end();  //ending the response
        });
    });
});

//Update Ventillator
app.put('/ventillatordetails/updateventillator',middleware.checkToken, function (req, res) {        //post method is used for updating data existing in database
    console.log("Fetching ventillator Details from Ventillators Details Collection...");
    let hospitalId = req.body.hId;
    let ventillatorId = req.body.vId;   //getting the details from user for updating data
    let ventillatorStatus = req.body.status;
    db.collection('ventillatorDetails', function (err, collection) {//updateOne method is used for updating data
        collection.updateOne({ "vId": ventillatorId }, { $set: { "hId": hospitalId, "vId": ventillatorId, "status": ventillatorStatus } }, (err, items) => {
            if (err) throw err;             //if error displaying error
            res.write("Successfully Updated!")      //if no error update data from database and give confirmation
            console.log(items); 
            res.end();      //ending the response            
        });
    });
});
