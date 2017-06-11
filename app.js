const apiKey = 'AIzaSyAlkWwYtc1q1o09XwKEb7KJwlk0cKBP6XQ';

var googleTranslate = require('google-translate')(apiKey);
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
    messenger_setgreetingtext();
    messenger_getstartedbutton();
    messenger_persistentmenu();
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
        var event = messaging_events[i];
        if (event.message && event.message.text) {
            messenger_receive(event);
        }
    }
    res.sendStatus(200);
});

var messenger_setgreetingtext = function() {
    var text = "Let's chat about sexual health!\n";
    var options = {
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
        method: 'POST',
        json: {
            'greeting':[
                {
                    'locale':'default',
                    'text':text
                }
            ]
        }
    }
    request(options)
}

var messenger_persistentmenu = function() {
    var options = {
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
        method: 'POST',
        json: {
            'persistent_menu':[
                {
                    'locale':'default',
                    'composer_input_disabled':true,
                    'call_to_actions':[
                        {
                            'title':'Topics',
                            'type':'nested',
                            'call_to_actions':[
                                {
                                    'title':'Menstruation',
                                    'type':'postback',
                                    'payload':'PAYLOAD'
                                },
                                {
                                    'title':'Sex',
                                    'type':'postback',
                                    'payload':'LOCAL_RESOURCES_PAYLOAD'
                                },
                                {
                                    'title':'Contraceptives',
                                    'type':'postback',
                                    'payload':'LOCAL_RESOURCES_PAYLOAD'
                                },
                                {
                                    'title':'STDs',
                                    'type':'postback',
                                    'payload':'PAYLOAD'
                                },
                                {
                                    'title':'Pregnancy',
                                    'type':'postback',
                                    'payload':'PAYLOAD'
                                }
                            ]
                        },
                        {
                            'title':'Local Resources',
                            'type':'postback',
                            'payload':'LOCAL_REOURCES_PAYLOAD'
                        }
                    ]
                },
                {
                    'locale':'zh_CN',
                    'composer_input_disabled':false
                }
            ]
        }
    }
    request(options)
}

var messenger_getstartedbutton = function () {
    var options = {
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + access_token,
        method: 'POST',
        json: {
            'get_started':{
                'payload':'GET_STARTED_PAYLOAD'
            }
        }
    }
    request(options)
}

var messenger_receive = function (event) {
    console.log(event);
    addMonkeyIfPossible(event);

    var text = event.message.text;
    if (event.message.text.includes("local")) {
        getLocalResources(event);
        //text = getLocalResources(event);
    }

    googleTranslate.translate(text, 'en', function(err, translation) {
    	  var reply = response.respond(event.sender.id, translation.translatedText);
  	  googleTranslate.translate(reply, translation.detectedSourceLanguage, function(err, translation) {
  		  messenger_send(event.sender.id, translation.translatedText);
  	  });
    });
    //messenger_send(event.sender.id, response.respond(event.sender.id, event.message.text));
}

function getLocalResources(event) {
    var options = {
        url: 'http://data.unhcr.org/api/whos_doing_what_where/settlements.json?instance_id=liberia',
        method: 'GET'
    };
    function callback(error, resp, body) {
        if (!error && resp.statusCode == 200) {
            var info = JSON.parse(body);
            messenger_send(event.sender.id, response.respond(event.sender.id, "local " + body.substring(0,50)));
            console.log(info);
            return body.substring(0,50);
        }
    }
    request(options, callback);
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

    // messenger_send(event.sender.id, response.respond(event.sender.id, event.message.text));
}

app.listen(port, function() {
    console.log("running at port " + port);
});
