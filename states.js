var storage = require('./storage');
var prompts = require('./prompts');
var options = require('./options');
var search = require('./search');
var images = require('./images');

var hasWords = function(text, wordList) {
	var arr = text.split(" ");
	for (i in wordList) {
		var word = wordList[i];
		if (arr.indexOf(word) !== -1) {
			return true;
		}
	}
	return false;
}
var checkGreetings = function(text) {
	return hasWords(text, ["hi", "hello", "hey"]);
};

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
    if (checkGreetings(text)) {
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
        cleantext = text.toLowerCase().replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
        if (images[cleantext]) {
          cb(images[cleantext].text, [], [], null, images[cleantext].image_url);
        } else {
          cb('Couldn\'t find a picture of that--sorry!', [], [], null, null);
        }
      } else if (prompt[1] == 'search') {
        trigger_search(user, text, cb);
      }
    }
  }
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
  })
}

module.exports = {
  'receive': receive,
  'trigger_greeting': trigger_greeting
}
