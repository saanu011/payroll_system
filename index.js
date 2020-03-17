const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const apiUser = require('./api/index');
const path = require('path');

const app = express();

//middlewares
app.use(bodyparser.json({ useNewUrlParser : true}));
app.use(cors());

app.use('/', apiUser);

app.use('/', (req, res) => {
    res.send("This is a problem of Projecticle motion.")
});

app.use('/bouncingball', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'))
});

const port = 4000;
app.listen(port, (err) => {
    if (err) console.log("error occured");
    else console.log(`Server started at port: ${port}`);
});