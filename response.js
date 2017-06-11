var answers = require('./answers');
var stopwords = require('./stopwords');
// var storage = require('./storage');

var makeDictionary = function(d) {
	var final = {}
	for (item in d) {
		var key = item.toLowerCase();
		var val = d[item];
		final[key] = val;
	}
	return final
}

var answerDict = makeDictionary(answers);

var removePunc = function(text) {
	return text.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
}

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

var cleanText = function(text) {
	text = text.toLowerCase();
	text = removePunc(text);
	return text;
}

var countDict = function(arr) {
	var dict = {};
	for (i in arr) {
		var val = arr[i];
		if (!(val in dict)) {
			dict[val] = 0;
		}
		dict[val] += 1;
	}
	return dict;
}

var checkFave = function(text) {
	return hasWords(text, ["you"]) && hasWords(text, ["best", "fav", "fave", "favorite", "awesome", "smart"]);
};

var checkGreetings = function(text) {
	return hasWords(text, ["hi", "hello", "hey"]);
};

var checkAgreement = function(text) {
	return hasWords(text, ["yes", "yep", "okay"]);
};

var checkLocalResources = function(text) {
	return hasWords(text, ["local"]);
};

var stringDistance = function(str1, str2) {

	str1 = removePunc(str1);
	str2 = removePunc(str2);
	var arr1 = str1.split(" ");
	var arr2 = str2.split(" ");
	var matches = 0;
	var dict1 = countDict(arr1);
	var dict2 = countDict(arr2);

	for (key in dict1) {
		if (key in dict2) {
			matches += Math.min(dict1[key], dict2[key]);
		}
	}
	matches = matches/(arr1.length+arr2.length);
	return matches;
}

var getCloserString = function(closestStr, newStr, text) {
	closestStr = closestStr.toLowerCase();
	newStr = newStr.toLowerCase();

	var closestScore = stringDistance(closestStr, text);
	var newScore = stringDistance(newStr, text);
	if (newScore > closestScore) {
		return newStr;
	}
	return closestStr;
}

var getClosestString = function(questions, text) {
	var closestQuestion = '';
	for (i in questions) {
		var question = questions[i];
		closestQuestion = getCloserString(closestQuestion, question, text);
	}
	return closestQuestion;
}

var getQuestionPreComment = function() {
	var commentArray = [
		"",
		"",
		"Good question!",
		"Great question!",
		"Very good question!",
		"Smart question!",
		"Hmm... Let me see.",
		"Okay, let's see.."
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var getQuestionPostComment = function() {
	var commentArray = [
		"",
		"",
		"",
		"Make sense?",
		"\nAnything else you want to know?",
		"\nAny questions?",
		"That's pretty much it!",
		"I hope that makes sense!",
		"I hope that helps!"
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var searchAnswers = function (userId, text) {
	var questions = Object.keys(answerDict);
	var closestQuestion = getClosestString(questions, stopwords.removeStopWords(text).join(' '));
	if (closestQuestion === '') {
		closestQuestion = getClosestString(questions, text);
		if (closestQuestion === '') {
			return '🙊\nI\'m sorry, I didn\'t understand that.\nCould you ask in another way?';
		}
		return '🙊\nI\'m sorry, I didn\'t quite understand that.\nDid you mean:\n"' + closestQuestion +'"';
	}
	console.log("RESPONSE:");
	console.log(closestQuestion);
	console.log(answerDict[closestQuestion]);

	var responseArr = [
		'"'+closestQuestion+'"\n\n🐵',
		getQuestionPreComment(),
		answerDict[closestQuestion],
		getQuestionPostComment()
	];

	return responseArr.join(" ");
}

var respond = function (userId, text) {
	text = cleanText(text);
	if (checkLocalResources(text)) {
		return text.substring(5, text.length);
	}
	if (checkFave(text)) {
		return "🙉 Aww golly gee! Thanks!"
	}
	if (checkGreetings(text)) {
		return "🐵 I'm Madeliene!\nGreat to meet you!\n\nWhat are you interested in?\n1. I want to learn about sex\n2. I want to get hygiene products\n3. I want to find resources near me"
	}
	if (checkAgreement(text)) {
		return "🙉 That's great to hear!"
	}
	return searchAnswers(userId, text);
}

module.exports = {
	'respond': respond
}
