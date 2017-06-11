var storage = require('./storage');
var prompts = require('./prompts');
var options = require('./options');
var response = require('./response');


var receive = function (user, text, cb) {
  storage.get('state', user, function (err, res) {
    if (!res) {
      storage.set('state', user, 'greeting-p0', function (err, res) {
        prompt = prompts['greeting-p0']
        cb(prompt[0], prompt[2].map(function (oid) {
          return options[oid][0];
        }));
      })
    } else {
      act(res);
    }
  })

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
        var prompt = prompts[pid];
        cb(prompt[0], prompt[2].map(function (oid) {
          return options[oid][0];
        }));
      } else {
        cb(response.respond(user, text), []);
      }
    } else if (prompt[1] == 'search') {
      cb(response.respond(user, text), []);
    }
  }
}

module.exports = {
  'receive': receive
}
