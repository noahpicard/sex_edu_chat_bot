var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var secret = require('./secret');
var response = require('./response');
var app = express();
var port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/messenger', function (req, res) {
	if (req.query['hub.verify_token'] === secret.verify_token) {
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
}

var messenger_send = function (userId, text) {
  var options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + secret.access_token,
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
}

app.listen(port, function() {
  console.log("running at port " + port);
});
