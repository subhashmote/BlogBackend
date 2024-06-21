


const express = require("express");
const app = express(); // Express Setup 

const cors = require("cors");  // cors origin resource sharing 
const bcrypt = require("bcrypt"); // for encryption and decryption of the password 
const cookieParser = require("cookie-parser");  // for parsing the cookies 
const multer = require('multer'); 
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const jwt = require("jsonwebtoken");


app.use(cors({
     credentials:true,
     origin:true,
}));


app.use(express.json()); // for body parsing 
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

require("dotenv").config(); // load the configurations in process object 
const PORT = process.env.PORT || 5000;


const dbConnect = require("./config/database");
dbConnect();  // this is function for database connection 



const blogroutes = require("./routes/blog");  // import  all the routes from routes folder
app.use(blogroutes);  // mouting the routes 


app.listen(PORT,() => {
     console.log(`App is Running on the port ${PORT}`); // listing the application on certain port number.
});