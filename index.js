const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const apiUser = require('./api/index');
const config = require('./config/config')
const path = require('path');
const mongoose = require('mongoose');

const app = express();

//middlewares
app.use(bodyparser.json({ useNewUrlParser : true}));
app.use(cors());

mongoose.connect(`mongodb://127.0.0.1:27017/${config.db_name}`, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) console.log(err);
    else console.log("Connected to db");
});

app.use('/', apiUser);

app.use('/', (req, res) => {
    res.send("This is a Payroll System.");
});

app.use('/bouncingball', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'))
});

app.listen(config.port, (err) => {
    if (err) console.log("error occured");
    else console.log(`Server started at port: ${config.port}`);
});