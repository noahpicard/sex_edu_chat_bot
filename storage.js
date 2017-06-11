var redis = require("redis");
client = redis.createClient(process.env.REDIS_URL);

var set = function (table, user, value, callback) {
  var key = table + '-' + user;
  client.set(key, value, function (err, res) {
    callback(err, res);
  });
}

var get = function (table, user, callback) {
  var key = table + '-' + user;
  client.get(key, function (err, res) {
    callback(err, res);
  });
}

module.exports = {
  'set': set,
  'get': get
}
