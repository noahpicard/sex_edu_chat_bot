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

	messenger_send(event.sender.id, response.respond(event.sender.id, event.message.text));
  // messenger_send(event.sender.id, event.message.text);
}

var messenger_send = function (userId, text) {
	text_portions = [];
	while (text.length > 0) {
		var portion = text.substr(0, 637);
		if (portion.length == 637) {
			portion = portion + '...';
		}
		text_portions.push(portion);
		text = text.substr(637);
	}

	var send_portion = function (i) {
		if (i >= text_portions.length) {
			return;
		}
		var options = {
	    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
	    method: 'POST',
	    json: {
	      'recipient':{
	        'id': userId
	      },
	      'message':{
	        'text': text_portions[i]
	      }
	    }
	  };
		request(options).on('response', function () {
			send_portion(i+1);
		});
	}
	send_portion(0);
}

app.listen(port, function() {
  console.log("running at port " + port);
});
