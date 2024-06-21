

const mongoose = require("mongoose");

require("dotenv").config();
const MONGODB_URL = process.env.MONGODB_URL;


const dbConnect = () => {
    mongoose.connect(MONGODB_URL)
    .then(()=>{
        console.log("DataBase Connected Successfully");
    })
    .catch((error)=>{
        console.log("Error in Connecting the DataBase");
    })
}

module.exports = dbConnect;