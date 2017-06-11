var answers = require('./answers');

var checkFave = function (text) {
	return text.includes("you") && text.includes("fav")
};

var checkGreetings = function (text) {
	return text.includes("hi ") || text.includes("hello") || text.includes("hey")
};

var cleanText = function (text) {
	text = text.toLowerCase();
	return text;
}

var stringDistance = function(str1, str2) {
	console.log(str1);
	console.log(str2);
	var arr1 = str1.split(" ");
	var arr2 = str2.split(" ");
	var matches = 0;
	console.log("arr1");
	console.log(arr1);
	console.log("arr2");
	console.log(arr2);
	for (i1 in arr1) {
		for (i2 in arr2) {
			s1 = arr1[i1];
			s2 = arr2[i2];
			console.log(s1);
			console.log(s2);
			if (s1 === s2) {
				matches += 1;
			}
		}
	}
	for (i2 in arr2) {
		for (i1 in arr1) {
			s1 = arr1[i1];
			s2 = arr2[i2];
			console.log(s1);
			console.log(s2);
			if (s1 === s2) {
				matches += 1;
			}
		}
	}
	return matches;
}

var getClosestString = function(closestStr, newStr, text) {
	console.log(closestStr);
	console.log(newStr);
	console.log(text);
	closestStr = closestStr.toLowerCase();
	newStr = newStr.toLowerCase();

	var closestScore = stringDistance(closestStr, text);
	var newScore = stringDistance(newStr, text);
	if (newScore > closestScore) {
		return newStr;
	}
	return closestStr;
}

var searchAnswers = function (userId, text) {
	var answerDict = answers.answerDict;
	console.log(text);
	var questions = Object.keys(answerDict);
	var closestQuestion = '';
	for (i in questions) {
		var question = questions[i];
		closestQuestion = getClosestString(closestQuestion, question, text);
	}
	if (closestQuestion === '') {
		return '🙊\nI\'m sorry, I didn\'t grok that.\nCould you rephrase?';
	}
	return answerDict[closestQuestion];
}


var respond = function (userId, text) {
	text = cleanText(text);
	if (checkFave(text)) {
		return "Aww thanks!"
	}
	if (checkGreetings(text)) {
		return "🐵 I'm Madeliene!\nGreat to meet you!\n\nWhat are you interested in?\n1. I want to learn about sex\n2. I want to get hygiene products\n3. I want to talk to a real person"
	}
	return searchAnswers(userId, text);
};

module.exports = {
	'respond': respond
}