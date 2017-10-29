const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require("request");
const keys = require("./api_keys.js");
const querystring = require('querystring');

app.post("/convert_video", (req, res) =>
	{
		console.log(keys.ms_api_key_primary)
		headers = {'Ocp-Apim-Subscription-Key' : keys.ms_api_key_primary}
		params = {"name" : "1234", "privacy" : "Private", "videoUrl":"https://r3---sn-q4flrner.googlevideo.com/videoplayback?sparams=dur,ei,expire,id,initcwndbps,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&lmt=1509161730118341&ip=2001%3A19f0%3A5%3A1de%3A5400%3Aff%3Afe4f%3A2207&expire=1509250327&id=o-APqWr8TB_HVV0hEDSdD2P_37GYHsgcY3f6pJPuIbaIua&ipbits=0&dur=117.980&mime=video%2Fmp4&key=cms1&source=youtube&itag=22&requiressl=yes&ei=tgD1We7_NpLg8wTWo6y4DQ&signature=476E73DFDB29693A078D60198791B681C612A120.2BBC833F6D45FBAEC8599E4360B2BFD016164C38&ratebypass=yes&pl=18&cms_redirect=yes&mip=139.138.146.195&mm=31&mn=sn-q4flrner&ms=au&mt=1509239450&mv=m"}
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
				}
			}
		);
	}
);
