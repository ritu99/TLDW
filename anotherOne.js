const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require("request");
const keys = require("./api_keys.js");
const querystring = require('querystring');
const MongoClient = require("mongodb").MongoClient;
const MONGO_URL = "mongodb://localhost:27017/videos";
const unirest = require("unirest");
const sum = require( 'sum' );

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.listen(3000, function(){console.log("listening")})
app.get('/', (req, res) =>{
	res.sendFile(__dirname  + '/Rohan.html')
})

function talkToMicrosoft(url, videourl, rest){
	console.log(keys.ms_api_key_primary)
	headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
	//"https://r3---sn-q4flrner.googlevideo.com/videoplayback?sparams=dur,ei,expire,id,initcwndbps,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&lmt=1509161730118341&ip=2001%3A19f0%3A5%3A1de%3A5400%3Aff%3Afe4f%3A2207&expire=1509250327&id=o-APqWr8TB_HVV0hEDSdD2P_37GYHsgcY3f6pJPuIbaIua&ipbits=0&dur=117.980&mime=video%2Fmp4&key=cms1&source=youtube&itag=22&requiressl=yes&ei=tgD1We7_NpLg8wTWo6y4DQ&signature=476E73DFDB29693A078D60198791B681C612A120.2BBC833F6D45FBAEC8599E4360B2BFD016164C38&ratebypass=yes&pl=18&cms_redirect=yes&mip=139.138.146.195&mm=31&mn=sn-q4flrner&ms=au&mt=1509239450&mv=m"
	console.log(url);
	params = {"name" : videourl, "privacy" : "Private", "videoUrl":url, "description": videourl, "callbackUrl": "http://52.170.103.220/finished_processing"}
	request.post({
		headers: headers,
		url:'https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns?' + querystring.stringify(params)
		},
		function(error, response, body){
			if(error){
				console.log(error);
			}else{
				console.log("response:\n" + response);
				console.log("------------\nbody:\n" + body.replace("\"", "").replace("\"", ""));
				body = body.replace("\"", "").replace("\"", "")
				MongoClient.connect(MONGO_URL, (err, db) => {
					db.collection("videos").insertOne({videoURL: videourl, state: "Processed", url: url, id: body}, function(err, res) {
				    if (err) throw err;
				    console.log("1 video inserted");
            doShit(body, rest)
				    db.close();
				  });
				});
			}
		}
	);
}

function doShit(id, res){
  MongoClient.connect(MONGO_URL, (err, db) => {
    db.collection("videos").findOne({id: id}, (err, result) => {
      if(err) throw err;
      if(result && result['VttUrl'] != null){
        //res.json(result['VttUrl']);
        console.log("a " + result)
        res.render(__dirname + "/test.ejs", {videoURL: "https://www.youtube.com/embed/" + getId(result['videoURL']), videoID: getId(result['videoURL']), id: result['id']});
      }
      else if(result){
        headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
        console.log("https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns/" + id+ "/VttUrl")
        res.render(__dirname + "/test.ejs", {videoURL: "https://www.youtube.com/embed/" + getId(result['videoURL']), videoID: getId(result['videoURL']), id: result['id'],});

      }else{
        headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
        console.log(id)
        // res.json({"here":"there's no data"});
      }
    });
  });
}

function getCaptions(data){
	return data.substring(7).split(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9] --> [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9]/).join("");
}

function saveData(id, data){
	// var trans = getCaptions(data);
	// getSummary(trans, id);
	db.collection("videos").updateOne({videoUrl: id}, {$set: {rawData: trans, state: "Processed"}},
	(err, result) => {
		collectData(result);
	});
}

function collectData(id, res, item){
	headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
  console.log(item.substring(0,item.length - 1).substring(1));
	request.get({headers: headers, url: item.substring(0,item.length - 1).substring(1)},
	 function(error, response, body){
     console.log(body);
      if(body.length > 100){
        res.json({"error":"none", "data" : body.substring(7).split("\n").join(" "), "summary" : sum({'corpus': getCaptions(body).substring(7).split("\n").join(""), 'nSentences' : 12})})
      }else
			   res.json({"error":"lots"});
		console.log(body);
	});
}

// app.post("/finished_processing", (req, res) =>  {
// 	console.log("wfewefwefwefwefwe");
// 	MongoClient.connect(MONGO_URL, (err, db	) => {
// 	  if(err) throw err;
// 		db.collection("videos").findOne({videoUrl: req.body['id']}, (err, result) => {
// 			if (err) throw err;
// 			console.log("finished processing a video " + req.body['id']);
// 			db.collection("videos").updateOne({videoUrl: req.body['id']}, {$set: {state: "Processed"}}, (err, result) => {
// 				collectData(req.body['id']);
// 			});
// 		});
// 	});
// });


function processVideo(req){
	console.log("wfewefwefwefwefwe");
	MongoClient.connect(MONGO_URL, (err, db	) => {
        db.collection("videos").findOne({videoUrl: req.body['id']}, (err, result) => {
                if (err) throw err;
                console.log("finished processing a video " + req.body['id']);
                db.collection("videos").updateOne({videoUrl: req.body['id']}, {$set: {state: "Processed"}}, (err, result) => {
                        collectData(req.body['id']);
                });
        });
			});
}

function getSummary(data, id, res){

  var Request = unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer")
    .headers({
        "X-Mashape-Authorization": keys.mashape_api_key,
        "Content-Type": "application/json"
    })
    .send("sentnum = 12")
    .send("text: " + getCaptions(data))
    .end(function (response) {
      res.json({"error":"none", "data" : data, "summary" : response})
    });
}

app.post("/get_data", (req, res) => {
  headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
    // res.json({body});
  MongoClient.connect(MONGO_URL, (err, db	) => {
    request.get({headers: headers, url:"https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns/" + req.body['id']  + "/VttUrl"}, (err, response, body) => {
      if(err) throw err;

      db.collection("videos").update({id: req.body['id']}, {$set: {VttUrl: body}}, function(e, r){
        db.collection("videos").findOne({id: req.body['id']}, (err, result) => {
          if(err) throw err;
          console.log(result);
          console.log("ege" + req.body)
          collectData(req.body['id'], res, result['VttUrl']);
        });
      });
  });
});
});

function getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}


app.post("/summarize_video", (req, res) =>
	{
		console.log(req.body['video-url']);
		MongoClient.connect(MONGO_URL, (err, db) => {
		    if(err) throw err;
			db.collection("videos").findOne({videoURL: req.body['video-url'], state: "Processed"}, (err, result) => {
				if(err) throw err;
				if(result){
					console.log(result);
					res.render(__dirname + "/test.ejs", {videoURL: "https://www.youtube.com/embed/" + getId(req.body['video-url']), videoID: getId(result['videoURL']), vttUrl: result['VttUrl'], id: result['id']});
				}else{
					// res.sendFile(__dirname + "/index.ejs");
					var hash = "c29628c0ddd12d794c196db6eb04a730";
					_url = "https://" + "helloacm.com" + "/api/video/?cached&lang=en&page=youtube&hash=" + hash + "&video="+encodeURIComponent(req.body['video-url'])
					k = request.get(_url, { json: true },
						(error, response, body) => {
							console.log(body.url);
							talkToMicrosoft(body.url, req.body['video-url'], res);
							// console.log(body);
						});
				}
			});
		});

	}
);
