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

// create string with date for query to wikipedia
var today = new Date();
Date.prototype.strDateQuery = function(){
	var monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var month = today.getMonth();
	return monthsArr[month]+'%20'+today.getDate()+'';
}

// callback executed during query of Wikipedia, returning events html from wikipedia query object
var getTodaysEvents = function(wikiQueryData){
	// get pageID for use in extracting content for any date
	var pageID = wikiQueryData.query.pageids[0];
	// extract events content
	console.log(wikiQueryData.query.pages[pageID].revisions[0]['*']);
	return wikiQueryData.query.pages[pageID].revisions[0]['*']
}



// URL used to query wikipedia via JSONP
var wikiEventsQueryURL = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvparse=&rvlimit=1&rvsection=1&indexpageids=&titles="+today.strDateQuery()+"&format=json&callback=getTodaysEvents";

// variable containing script element
var getWikiEventsScriptEl = $('<script>').attr("src", wikiEventsQueryURL);

$(document).on('ready', function() {
	// inject script to get events data from wikipedia via JSONP
  $('body').append(getWikiEventsScriptEl);
});