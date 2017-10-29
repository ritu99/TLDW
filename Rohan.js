const express = require('express');
const bodyParser= require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.listen(3000, function() {
	console.log('listening on 3000')
})

app.get('/', (req, res) =>{
	res.sendFile('/Users/mercury/Documents/Workspace/Misc Projects/HackTX2017/TLDW/Rohan.html')
})

app.post('/vids', (req, res) =>{
	console.log(req.body.txt);

})

