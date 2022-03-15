const express = require('express');


// instantiate express
const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// serve static files from public folder
app.use(express.static('public/static/'));

module.exports = app;