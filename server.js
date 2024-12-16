const express = require('express');
const app = express();
require('dotenv').config();
const db = require("./db")

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT =  process.env.PORT || 3000;

// const { jwtAuthMiddleware} = require("./jwt");



db.connectTodb()


const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');


app.use('/user' , userRoutes);
app.use('/candidate' ,  candidateRoutes);


app.listen(PORT, () => {
    console.log("server is running on 3000");
});