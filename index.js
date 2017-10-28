const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const videoConverter = require('./videoURL.js');

app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, function() {
	console.log('listening on 3000');
	videoConverter.convert('https://www.youtube.com/watch?v=I30cRCjd6es&app=desktop')
})
