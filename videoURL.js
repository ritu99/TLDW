var request = require('request');

var videoConverter = {
	convert: function(url) {
		console.log(url);
		request.get({url:"https://happyukgo.com/api/video/?cached&video=" + encodeURIComponent(url)}, 
			function(err, res, body){
				console.log(err);
				console.log(body);
				//console.log(res);
		});
	}
}


module.exports = videoConverter
