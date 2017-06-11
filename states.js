var storage = require('./storage');
var prompts = require('./prompts');
var options = require('./options');
var search = require('./search');

var receive = function (user, text, oid, cb) {
  if (oid) {
    // postbacks
    language = oid.substr(0, 2);
    oid = oid.substr(2);
    var pid = options[oid][1];
    var prompt = prompts[pid];
    cb(prompt[0], prompt[2].map(function (oid) {
      return options[oid][0];
    }), prompt[2], language);
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
          }), prompt[2], null);
        });
      } else {
        trigger_search(user, text, cb);
      }
    } else if (prompt[1] == 'search') {
      trigger_search(user, text, cb);
    }
  }
}

var trigger_search = function (user, text, cb) {
  search.respond(user, text, function (reply) {
    if (reply) {
      cb(reply, [], [], null);
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
    }), prompt[2]);
  })
}

module.exports = {
  'receive': receive,
  'trigger_greeting': trigger_greeting
}
