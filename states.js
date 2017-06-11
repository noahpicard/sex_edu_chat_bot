var storage = require('./storage');
var prompts = require('./prompts');
var options = require('./options');
var search = require('./search');
var images = require('./images');
var texttools = require('./texttools');
var request = require('request');

var receive = function (user, text, oid, cb) {
  if (oid) {
    // postbacks
    language = oid.substr(0, 2);
    oid = oid.substr(2);
    var pid = options[oid][1];
    storage.set('state', user, pid, function (err, res) {
      var prompt = prompts[pid];
      cb(prompt[0], prompt[2].map(function (oid) {
        return options[oid][0];
      }), prompt[2], language, null);
    });
  } else {
    storage.get('state', user, function (err, res) {
      // get state
      if (!res) {
        trigger_greeting(user, cb);
      } else {
        act(res);
      }
    });
  }

  var act = function (pid) {
    if (texttools.checkGreetings(text)) {
      trigger_greeting(user, cb);
    } else {
      prompt = prompts[pid];
      if (prompt[1] == 'buttons') {
        var options_texts = prompt[2].map(function (oid) {
          return options[oid][0];
        });
        var i = options_texts.indexOf(text);
        if (i >= 0) {
          var oid = prompt[2][i];
          var pid = options[oid][1];
          storage.set('state', user, pid, function (err, res) {
            var prompt = prompts[pid];
            cb(prompt[0], prompt[2].map(function (oid) {
              return options[oid][0];
            }), prompt[2], null, null);
          });
        } else {
          trigger_search(user, text, cb);
        }
      } else if (prompt[1] == 'image_search') {
        cleantext = texttools.cleanText(text);
        if (images[cleantext]) {
          storage.set('state', user, 'greeting-p0', function (err, res) {
            cb(images[cleantext].text, [], [], null, images[cleantext].image_url);
          });
        } else {
          cb('Couldn\'t find a picture of that--sorry!', [], [], null, null);
		  getLocalResources("syria", function(list) {
			  cb('But you can ask some local NGOs in your camp: ' + list, [], [], null, null);
		  });
        }
      } else if (prompt[1] == 'search') {
        trigger_search(user, text, cb);
      } else {
        trigger_search(user, text, cb);
      }
    }
  }
}

var getLocalResources = function(country, cb) {
	var list = "";
	var options = {
        url: 'http://data.unhcr.org/api/whos_doing_what_where/settlements.json?instance_id=' + country,
        method: 'GET'
    };
    function callback(error, resp, body) {
		console.log(error);
        if (!error && resp.statusCode == 200) {
			var count = 0;
			var settlement = false;
            var info = JSON.parse(body, function (key, value) {
				if (key === "name" && value.includes("Zaatari")) {
					console.log(value + "\n");
					settlement = true;
				}
				if (settlement) {
					if (key === "name") {
						settlement == false;
					}
					if (key === "sector_name_en" && count < 5) {
						list += " " + value;
						count++;
					}
					if (key === "organization_acronym" && value && count < 5) {
						list += " (" + value + "),"
					}
				}
			});
			cb(list);
        }
    }
    request(options, callback);
}

var trigger_search = function (user, text, cb) {
  search.respond(user, text, function (reply) {
    if (reply) {
      cb(reply, [], [], null, null);
    } else {
      trigger_greeting(user, cb);
    }
  });
}

var trigger_greeting = function (user, cb) {
  storage.set('state', user, 'greeting-p0', function (err, res) {
    prompt = prompts['greeting-p0'];
    cb(prompt[0], prompt[2].map(function (oid) {
      return options[oid][0];
    }), prompt[2], null, null);
  });
}

module.exports = {
  'receive': receive,
  'trigger_greeting': trigger_greeting
}
