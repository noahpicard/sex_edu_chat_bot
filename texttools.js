var tt = {}

tt.removePunc = function(text) {
	return text.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
}

tt.hasWords = function(text, wordList) {
	var arr = text.split(" ");
	for (i in wordList) {
		var word = wordList[i];
		if (arr.indexOf(word) !== -1) {
			return true;
		}
	}
	return false;
}

tt.cleanText = function(text) {
	text = text.toLowerCase();
	text = tt.removePunc(text);
	return text;
}

tt.checkFave = function(text) {
	return tt.hasWords(text, ["you", "you're"]) && tt.hasWords(text, ["best", "fav", "fave", "favorite", "awesome", "smart", "great", "wonderful"]);
};

tt.checkThanks = function(text) {
	return tt.hasWords(text, ["thank", "thanks"]);
};

tt.checkParting = function(text) {
	return tt.hasWords(text, ["goodbye", "bye", "byebye"]);
};

tt.checkGreetings = function(text) {
	return tt.hasWords(text, ["hi", "hello", "hey"]);
};

tt.checkAgreement = function(text) {
	return tt.hasWords(text, ["yes", "yep", "okay"]);
};

tt.checkRandomQuestion = function(text) {
	return tt.hasWords(text, ["random", "rand"]) && tt.hasWords(text, ["question", "questions", "definition", "definitions"]);
};

tt.checkLocalResources = function(text) {
	return tt.hasWords(text, ["local"]);
};

module.exports = tt;
