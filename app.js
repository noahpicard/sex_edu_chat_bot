var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var response = require('./response');
var app = express();
var port = process.env.PORT || 8000;
var verify_token = process.env.VERIFY || require('./secret').verify_token;
var access_token = process.env.ACCESS || require('./secret').access_token;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/messenger', function (req, res) {
	if (req.query['hub.verify_token'] === verify_token) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
});

app.post('/messenger', function (req, res) {
  var messaging_events = req.body.entry[0].messaging;
  for (var i = 0; i < messaging_events.length; i++) {
    var event = messaging_events[i];
    if (event.message && event.message.text) {
      messenger_receive(event);
    }
  }
  res.sendStatus(200);
});

var messenger_receive = function (event) {
  console.log(event);
  addMonkeyIfPossible(event);
  messenger_send(event.sender.id, response.respond(event.sender.id, event.message.text));
}
function addMonkeyIfPossible(event) {
	if(response.respond(event.sender.id, event.message.text).indexOf("🐵") != -1 && response.respond(event.sender.id, event.message.text).indexOf("😄") != -1){
    //here in respond could toggle if send and image or not! cause respond called here
  	messenger_send_pic(event.sender.id, "http://orig14.deviantart.net/49d9/f/2017/161/2/5/monkeyvictor_by_chibixi-dbcal2t.gif");
  } else if(response.respond(event.sender.id, event.message.text).indexOf("🐵") != -1){
  	messenger_send_pic(event.sender.id, "http://orig12.deviantart.net/08c8/f/2017/161/b/f/monkeyassets_by_chibixi-dbcagez.gif");
  }
}
function messenger_send_pic(userId,imageURL) {
    var options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
    method: 'POST',
    json: {
      'recipient':{
        'id': userId
      },
      'message':{
		"attachment":{
		  "type":"image",
		  "payload":{
			"url":imageURL
		  }
		}
	  }
	  }
  };
  request(options);
  var options2 = {
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
    method: 'POST',
    json: {
      'recipient':{
        'id': userId
      },
      "sender_action":"typing_on"
	  }
  };
  request(options2);
}

var messenger_send = function (userId, text) {
  var options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
    method: 'POST',
    json: {
      'recipient':{
        'id': userId
      },
      'message':{
        'text': text
      }
    }
  };
  request(options);
  var options2 = {
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
    method: 'POST',
    json: {
      'recipient':{
        'id': userId
      },
      "sender_action":"typing_on"
	  }
  };
  request(options2);
}

app.listen(port, function() {
  console.log("running at port " + port);
});
