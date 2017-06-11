var answers = require('./answers');
var stopwords = require('./stopwords');
var texttools = require('./texttools');

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

var stringDistance = function(str1, str2) {

	str1 = texttools.removePunc(str1);
	str2 = texttools.removePunc(str2);
	var arr1 = str1.split(" ");
	var arr2 = str2.split(" ");
	console.log(arr1);
	console.log(arr2);
	var matches = 0;
	var dict1 = countDict(arr1);
	var dict2 = countDict(arr2);

	for (key in dict1) {
		if (key in dict2) {
			matches += Math.min(dict1[key], dict2[key]);
		}
	}

	matches = matches/(1+(Math.abs(arr1.length-arr2.length)));
	return matches;
}


var getClosestString = function(questions, text) {
	var closestQuestion = '';
	var closestScore = 0;
	for (i in questions) {
		var question = questions[i];
		question = question.toLowerCase();

		var scoreQuestion = stopwords.removeStopWords(question).join(' ')
		if (text.length != stopwords.removeStopWords(text).join(' ').length) {
			scoreQuestion = question;
		}

		var newScore = stringDistance(scoreQuestion, text);
		if (newScore > closestScore) {
			closestQuestion = question;
			closestScore = newScore;
		}
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
		"\nAny other questions?",
		"That's pretty much it!",
		"I hope that makes sense!",
		"I hope that helps!"
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var getDefinitionPreComment = function() {
	var commentArray = [
		"",
		"",
		"",
		"Let's investigate..",
		"Hmm... Let me see.",
		"Okay, let's see.."
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var getDefinitionPostComment = function() {
	var commentArray = [
		"",
		"",
		"",
		"\nAnything else you want to know?",
		"\nDoes that help your understanding?",
		"I hope that makes sense!",
		"I hope that helps!"
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var isQuestion = function(text) {
	return text.includes("?");
}

var searchAnswers = function (userId, text) {
	var questions = Object.keys(answerDict);
	var closestQuestion = getClosestString(questions, stopwords.removeStopWords(text).join(' '));
	if (closestQuestion === '') {
		closestQuestion = getClosestString(questions, text);
		if (closestQuestion === '') {
			return '🙊\nI\'m sorry, I didn\'t understand that.😞\nCould you ask in another way?';
		}
		return '🙊\nI\'m sorry, I didn\'t quite understand that.\nDid you mean:\n"' + closestQuestion +'"';
	}
	//console.log("RESPONSE:");
	//console.log(closestQuestion);
	//console.log(answerDict[closestQuestion]);

	var responseArr = [
		'"'+closestQuestion+'"\n\n🐵',
		getQuestionPreComment(),
		answerDict[closestQuestion],
		getQuestionPostComment()
	];

	if (!isQuestion(closestQuestion)) {
		responseArr = [
			'"'+closestQuestion+'"\n\n🐵',
			getDefinitionPreComment(),
			answerDict[closestQuestion],
			getDefinitionPostComment()
		];
	}
	

	return responseArr.join(" ");
}

var getSampleQuestions = function() {
	var questions = Object.keys(answerDict);
	questions = questions.filter(function(question) { return question.includes("?") });
	var arr = ['Some examples of questions are:']
	for (i in [1,2,3]) {
		arr.push('"'+questions[Math.floor(Math.random() * questions.length)]+'"');
	}
	return arr.join("\n");
}

var getSampleDefinitions = function() {
	var questions = Object.keys(answerDict);
	questions = questions.filter(function(question) { return (!question.includes("?")) });
	var arr = ['Some examples of defintions are:']
	for (i in [1,2,3]) {
		arr.push('"'+questions[Math.floor(Math.random() * questions.length)]+'"');
	}
	return arr.join("\n");
}

var respond = function (user, text, cb) {
	text = texttools.cleanText(text);

	if (texttools.checkGreetings(text)) {
		cb(null);
	} else if (texttools.checkFave(text)) {
		cb("🙉 Aww golly gee! Thanks! 😀");
	} else if (texttools.checkThanks(text)) {
		cb("🙈 You're welcome! Happy to help! 😀");
	} else if (texttools.checkAgreement(text)) {
		cb("🙈 Awesome! That's great to hear!");
	} else if (texttools.checkParting(text)) {
		cb("🐒 See you later!\nCome by any time you have questions!");
	} else if (texttools.checkRandomQuestion(text)) {
		cb("🐵 Finding random questions... Here they are!\n\n" + getSampleQuestions() + "\n\n" + getSampleDefinitions());
	} else {
		cb(searchAnswers(user, text));
	}

}

module.exports = {
	'respond': respond
}
