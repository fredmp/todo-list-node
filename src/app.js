const glob = require( 'glob' );
const path = require( 'path' );
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

glob.sync(path.join('src', 'routes', '**/*.js')).forEach(function(file) {
  require(path.resolve(file)).setup(app);
});

module.exports = app;
