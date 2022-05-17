const express = require('express');
const app = express();

const route=require("./router/route")

var bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Pratice:MVLNdVEz62Td6t7j@cluster0.q9vy5.mongodb.net/group82Database", { useNewUrlParser: true })
    .then(() => console.log("mongoDB is Connected!!!"))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT||3000, function() {
    console.log('Express app running on port: ' ,process.env.PORT||3000)
});