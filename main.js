// constructor for history event objects
var HistoryEvent = function (eventStr, year){
	this.eventStr = eventStr;
	this.year = year;
	this.score = 4;
	this.attemptedQuestion = false;
}

// array of history event objects
var historyEventArr = [];

// method to push event to array
HistoryEvent.prototype.pushToArr = function(){
	historyEventArr.push(this);
}

// create guess year object
HistoryEvent.prototype.guessYear = function(){

}

var today = new Date();
Date.prototype.strDate = function(){
	month = today.getMonth();
	if (today.getMonth() == 0){
		month = 'January';
	}if (today.getMonth() == 1){
		month = 'February';
	}if (today.getMonth() == 2){
		month = 'March';
	}if (today.getMonth() == 3){
		month = 'April';
	}if (today.getMonth() == 4){
		month = 'May';
	}if (today.getMonth() == 5){
		month = 'June';
	}if (today.getMonth() == 6){
		month = 'July';
	}if (today.getMonth() == 7){
		month = 'August';
	}if (today.getMonth() == 8){
		month = 'September';
	}if (today.getMonth() == 9){
		month = 'October';
	}if (today.getMonth() == 10){
		month = 'November';
	}if (today.getMonth() == 11){
		month = 'December';
	}return month+'%'+today.getDate()+'';
}

$.getJSON("http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvlimit=1&rvparse=&rvsection=1&titles="+today.strDate()+"&format=json&callback?", function(data){
	console.log(data);
});



$(document).on('ready', function() {
  
});