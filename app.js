const express = require('express');


// instantiate express
const app = express();

// serve static files from public folder
app.use(express.static('public/static/'));

module.exports = app;