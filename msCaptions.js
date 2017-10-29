const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require("request");
const keys = require("./api_keys.js");
const querystring = require('querystring');
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/videos";
const unirest = require("unirest");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(3000, function(){})
app.get('/', (req, res) =>{
	res.sendFile(__dirname  + '/Rohan.html')
})

var db;
MongoClient.connect(url, (err, d) => {
    if(err) throw err;
    db = d;
});

function talkToMicrosoft(url, videourl){
	console.log(keys.ms_api_key_primary)
	headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
	//"https://r3---sn-q4flrner.googlevideo.com/videoplayback?sparams=dur,ei,expire,id,initcwndbps,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&lmt=1509161730118341&ip=2001%3A19f0%3A5%3A1de%3A5400%3Aff%3Afe4f%3A2207&expire=1509250327&id=o-APqWr8TB_HVV0hEDSdD2P_37GYHsgcY3f6pJPuIbaIua&ipbits=0&dur=117.980&mime=video%2Fmp4&key=cms1&source=youtube&itag=22&requiressl=yes&ei=tgD1We7_NpLg8wTWo6y4DQ&signature=476E73DFDB29693A078D60198791B681C612A120.2BBC833F6D45FBAEC8599E4360B2BFD016164C38&ratebypass=yes&pl=18&cms_redirect=yes&mip=139.138.146.195&mm=31&mn=sn-q4flrner&ms=au&mt=1509239450&mv=m"
	console.log(url);
	params = {"name" : videourl, "privacy" : "Private", "videoUrl":url, "description": videourl, "callbackUrl": "52.170.103.220/finished_processing"}
	request.post({
		headers: headers,
		url:'https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns?' + querystring.stringify(params)
		},
		function(error, response, body){
			if(error){
				console.log(error);
			}else{
				console.log("response:\n" + response);
				console.log("------------\nbody:\n" + body);

				db.collection("videos").insertOne({videoURL: videoURL, state: "Processing", url: url, id: body}, function(err, res) {
			    if (err) throw err;
			    console.log("1 video inserted");
			    db.close();
			  });
			}
		}
	);
}

function getCaptions(data){
	return data.substring(7).split(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9] --> [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9]/).join("");
}

function saveData(id, data){
	var trans = getCaptions(data);
	getSummary(trans, id);
	db.collection("videos").updateOne({videoUrl: id}, {$set: {rawData: trans}},
	(err, result) => {
		collectData(result);
	});
}

function collectData(id){
	headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
	request({header: headers, url:"https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns/"+id+"/VttUrl"},
	 function(error, response, body){
		 request({header: headers, url: body}, (err, res, bod) => {
			 saveData(id, bod);
		 });
		console.log(body);

	});
}

app.post("/finished_processing", (req, res) =>  {
	db.collection("videos").findOne({videoUrl: req.body['id']}, (err, result) => {
		if (err) throw err;
		console.log("finished processing a video " + req.body['id']);
		db.collection("videos").updateOne({videoUrl: req.body['id']}, {$set: {state: "Processed"}}, (err, result) => {
			collectData(req.body['id']);
		});
	});
});

function getSummary(data, id){
	headers = {"X-Mashape-Key" : keys.mashape_api_key}
	unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer-text")
		.header("X-Mashape-Key", keys.mashape_api_key)
		.header("Content-Type", "application/x-www-form-urlencoded")
		.header("Accept", "application/json")
		.send("sentnum=5")
		.send("text=" + data)
		.end(function (result) {
			db.collection("videos").update({id: id}, {$set: {summary: result}}, (err, result) =>
			{
				if(err) throw err;
				console.log(result);
			});
		});
}

app.post("/get_data", (req, res)){
	db.collection("groups").findOne({videoUrl: req.body['video-url'], state:"Processed"}, (err, result) => {
		if(err) throw err;
		if(result){
			res.json(result., summary: result.sum);
		}else{
				var options = { method: 'GET',
			  url: 'https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns/302ea8c917/VttUrl',
			  headers:
			   {
			     'ocp-apim-subscription-key': '200b40fa74dc4c8e885974ef0e442d33'},
			  formData: { id: '25606d0cfa' } };
				request(options, function (error, response, body) {
				  if (error) throw new Error(error);

				  console.log(body);
				});
			}else{
				res.json({"here":"there's no data"});
			}
		}
	}
}

app.post("/summarize_video", (req, res) =>
	{
		console.log(req.body['video-url']);
		db.collection("videos").findOne({videoUrl: req.body['video-url'], state: "Processed"}, (err, result) => {
			if(err) throw err;
	    if(result){
				console.log(result);
				res.sendFile(__dirname + "/index.html");
			}else{
				res.sendFile(__dirname + "/index.html");
				var hash = "c29628c0ddd12d794c196db6eb04a730";
				_url = "https://" + "helloacm.com" + "/api/video/?cached&lang=en&page=youtube&hash=" + hash + "&video="+encodeURIComponent(req.body['video-url'])
				k = request.get(_url, { json: true },
					(error, response, body) => {
						console.log(body.url);
						talkToMicrosoft(body.url, req.body['video-url']);
						// console.log(body);
					});
			}
		});


	}
);
