const mongoose = require("mongoose");
require('dotenv').config();

mongoose.Promise = global.Promise;

function connectTodb() {
    const baseURL = process.env.DB;
    console.log("MongoDB Connection String: ", baseURL);
    
    mongoose.connect(baseURL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Connected to MongoDB successfully");
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err.message);
        });
}

module.exports = { connectTodb };
