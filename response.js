var answers = require('./answers');
//var storage = require('./storage');
var request = require('request');

var checkLocalResources = function (text) {
	return text.includes("local");
}
var checkFave = function (text) {
	return text.includes("you") && text.includes("fav")
};

var checkGreetings = function (text) {
	return text.includes("hi") || text.includes("hello") || text.includes("hey")
};

var cleanText = function (text) {
	text = text.toLowerCase();
	return text;
}

var respond = function (userId, text) {
	text = cleanText(text);
	if (checkLocalResources(text)) {
		return text.substring(5, text.length);
	}
	if (checkFave(text)) {
		return "🐵 Aww thanks!😄"
	}
	if (checkGreetings(text)) {
		//return "🐵 I'm Madeleine!\nGreat to meet you!\n\nWhat are you interested in?\n1. I want to learn about sex\n2. I want to get hygiene products\n3. I want to talk to a real person"
		return "🐵 I'm Madeleine!\nGreat to meet you!\n\nWhat sexual health topic are you interested in?"
	}
	if (text == 'answer me') {
		return answers[15][1]; // random answer
	}
	return "I'm sorry, I didn't grok that. Could you rephrase?";
};

module.exports = {
	'respond': respond
}
