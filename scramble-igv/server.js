'use strict';

const express = require('express');
//const morgan = require('morgan');
//const auth = require('./auth');
//var path = require('path');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
//app.use(auth)
var path = require('path');

app.use(express.static(path.join(__dirname + '/dist/')));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
