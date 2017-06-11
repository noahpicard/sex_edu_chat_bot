const apiKey = 'AIzaSyAlkWwYtc1q1o09XwKEb7KJwlk0cKBP6XQ';

var googleTranslate = require('google-translate')(apiKey);
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var port = process.env.PORT || 8000;
var verify_token = process.env.VERIFY || require('./secret').verify_token;
var access_token = process.env.ACCESS || require('./secret').access_token;

var states = require('./states');

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
      var text = event.message.text;
      var user = event.sender.id;
      messenger_receive(event, user, text, null);
    } else if (event.postback) {
      var oid = event.postback.payload;
      var user = event.sender.id;
      messenger_receive(event, user, '', oid);
    }
    res.sendStatus(200);
  }
});

var messenger_receive = function (event, user, text, oid) {
  googleTranslate.translate(text, 'en', function(err, translation) {
    states.receive(user, translation.translatedText, oid, function (reply, buttons, oids, target_language, image_url) {
      addMonkeyIfPossible(event, reply, function () {
        buttons.push(reply);
        if (text == '') {
          var language = target_language;
        } else {
          var language = translation.detectedSourceLanguage;
        }
        googleTranslate.translate(buttons, language, function(err, translations) {
          if (Array.isArray(translations)) {
            reply = translations.pop().translatedText;
            buttons = translations;
          } else {
            reply = translations.translatedText;
            buttons = [];
          }
          messenger_send_prompt(user, reply, buttons, oids, language);
          if (image_url) {
            messenger_send_pic(user, image_url, function () {});
          }
        });
      });
    });
  });
}

var messenger_send_prompt = function (user, text, arr, oids, language) {
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
		} else if ((i == text_portions.length - 1) && arr.length > 0) {
      var buttons = arr.map(function (item, index) {
        return {
            "type": "postback",
            "title": item.translatedText,
            "payload": language + oids[index]
          };
      });
      var options = {
  	    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
  	    method: 'POST',
  	    json: {
  	      'recipient': {
  	        'id': user
  	      },
  	      "message": {
  			    "attachment": {
  			      "type": "template",
              "payload": {
                "template_type": "button",
                "text": text_portions[i],
                "buttons": buttons
              }
            }
          }
        }
      };
    } else {
      var options = {
  	    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + access_token,
  	    method: 'POST',
  	    json: {
  	      'recipient':{
  	        'id': user
  	      },
  	      "message": {
            'text': text_portions[i]
          }
        }
      }
    }
		request(options).on('response', function (a) {
			send_portion(i+1);
		});
	}
	send_portion(0);
}

function messenger_send_pic(userId, imageURL, cb) {
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
    request(options).on('response', function () {
      cb();
    });
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

function addMonkeyIfPossible(event, translated, cb) {
  console.log("OH " + translated);
   if (translated.indexOf("🙈") != -1) {
        //here in respond could toggle if send and image or not! cause respond called here
        messenger_send_pic(event.sender.id, "http://orig14.deviantart.net/49d9/f/2017/161/2/5/monkeyvictor_by_chibixi-dbcal2t.gif", cb);
    } else if (translated.indexOf("🙉") != -1 && translated.indexOf("😀") != -1) {
        //here in respond could toggle if send and image or not! cause respond called here
        messenger_send_pic(event.sender.id, "http://orig06.deviantart.net/c004/f/2017/162/1/1/monkeyembarras_by_chibixi-dbcaxg1.gif", cb);
    } else if (translated.indexOf("🙉") != -1) {
        //here in respond could toggle if send and image or not! cause respond called here
        messenger_send_pic(event.sender.id, "http://orig14.deviantart.net/49d9/f/2017/161/2/5/monkeyvictor_by_chibixi-dbcal2t.gif", cb);
    } else if (translated.indexOf("🙊") != -1 && translated.indexOf("😞") != -1 ) {
        messenger_send_pic(event.sender.id, "http://orig08.deviantart.net/f494/f/2017/162/7/2/monkeyconfused_by_chibixi-dbcaxg9.gif", cb);
    } else if (translated.indexOf("🙊") != -1) {
        messenger_send_pic(event.sender.id, "http://orig13.deviantart.net/4654/f/2017/162/e/7/monkeyquestion_by_chibixi-dbcaxge.gif", cb);
    } else if (translated.indexOf("🐒") != -1) {
        messenger_send_pic(event.sender.id, "http://orig02.deviantart.net/d9ad/f/2017/162/7/a/monkeybye_by_chibixi-dbcaxfv.gif", cb);
    } else if (translated.indexOf("🐵") != -1 && translated.indexOf("😀") != -1 ) {
        messenger_send_pic(event.sender.id, "http://orig12.deviantart.net/08c8/f/2017/161/b/f/monkeyassets_by_chibixi-dbcagez.gif", cb);
    } else if(translated.indexOf("condom") != -1) {
        messenger_send_pic(event.sender.id, "http://orig03.deviantart.net/20bb/f/2017/162/4/5/monkeybanana_by_chibixi-dbcaxfr.gif", cb);
    } else {
      cb();
    }
}

app.listen(port, function() {
    console.log("running at port " + port);
});



//
//
// var messenger_setgreetingtext = function() {
//     var text = "Let's chat about sexual health!\n";
//     var options = {
//         url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
//         method: 'POST',
//         json: {
//             'greeting':[
//                 {
//                     'locale':'default',
//                     'text':text
//                 }
//             ]
//         }
//     }
//     request(options)
// }
//
// var messenger_persistentmenu = function() {
//     var options = {
//         url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
//         method: 'POST',
//         json: {
//             'persistent_menu':[
//                 {
//                     'locale':'default',
//                     'composer_input_disabled':true,
//                     'call_to_actions':[
//                         {
//                             'title':'Topics',
//                             'type':'nested',
//                             'call_to_actions':[
//                                 {
//                                     'title':'Menstruation',
//                                     'type':'postback',
//                                     'payload':'PAYLOAD'
//                                 },
//                                 {
//                                     'title':'Sex',
//                                     'type':'postback',
//                                     'payload':'LOCAL_RESOURCES_PAYLOAD'
//                                 },
//                                 {
//                                     'title':'Contraceptives',
//                                     'type':'postback',
//                                     'payload':'LOCAL_RESOURCES_PAYLOAD'
//                                 },
//                                 {
//                                     'title':'STDs',
//                                     'type':'postback',
//                                     'payload':'PAYLOAD'
//                                 },
//                                 {
//                                     'title':'Pregnancy',
//                                     'type':'postback',
//                                     'payload':'PAYLOAD'
//                                 }
//                             ]
//                         },
//                         {
//                             'title':'Local Resources',
//                             'type':'postback',
//                             'payload':'LOCAL_REOURCES_PAYLOAD'
//                         }
//                     ]
//                 },
//                 {
//                     'locale':'zh_CN',
//                     'composer_input_disabled':false
//                 }
//             ]
//         }
//     }
//     request(options)
// }
//
// var messenger_getstartedbutton = function () {
//     var options = {
//         url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
//         method: 'POST',
//         json: {
//             'get_started':{
//                 'payload':'GET_STARTED_PAYLOAD'
//             }
//         }
//     }
//     request(options)
// }
//
// function getLocalResources(event) {
//     var options = {
//         url: 'http://data.unhcr.org/api/whos_doing_what_where/settlements.json?instance_id=liberia',
//         method: 'GET'
//     };
//     function callback(error, resp, body) {
//         if (!error && resp.statusCode == 200) {
//             var info = JSON.parse(body);
//             messenger_send(event.sender.id, response.respond(event.sender.id, "local " + body.substring(0,50)));
//             console.log(info);
//             return body.substring(0,50);
//         }
//     }
//     request(options, callback);
// }
