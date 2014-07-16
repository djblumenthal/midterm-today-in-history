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
	var todaysEventsRawHTML = wikiQueryData.query.pages[pageID].revisions[0]['*'];
	var todaysEventsContainer = $('<div class="todays-events-container">').html(todaysEventsRawHTML)
	$('.container').append(todaysEventsContainer);
	$(todaysEventsContainer).hide();
	var eventListItems = $('.todays-events-container > ul li');
	return parseEventsHTMLIntoObjects(eventListItems);
}


var parseEventsHTMLIntoObjects = function(listOfEvents){
	for (var i=0; i < listOfEvents.length; i++){
		// console.log(listOfEvents.eq(i).text());
		var yearStr = '';
		for (var j=0; j < listOfEvents.eq(i).text().length; j++){
			// check if character is a number
			if (listOfEvents.eq(i).text().charCodeAt(j)>47 && listOfEvents.eq(i).text().charCodeAt(j)<58) {
				// if it's a number, add it to the year string
				yearStr += listOfEvents.eq(i).text().charAt(j);
				// console.log(yearStr);
				// if the next character is not a number, test if it's a BC year, or break out of making year string
				if (!(listOfEvents.eq(i).text().charCodeAt(j+1)>47 && listOfEvents.eq(i).text().charCodeAt(j+1)<58)) {
					if ((listOfEvents.eq(i).text().charAt(j+2)=='B') && (listOfEvents.eq(i).text().charAt(j+3)=='C')) {
						yearStr += ' BC';
						break;
					}break; 
				}
			}
			// console.log(yearStr);
		}
		var eventStr = listOfEvents.eq(i).text().slice(yearStr.length + 3);
		// console.log(eventStr);
		// console.log(yearStr);
		var newHistoryEvent = new HistoryEvent(eventStr, yearStr);
		newHistoryEvent.pushToArr();
	}
	console.log(historyEventArr);
}

// URL used to query wikipedia via JSONP
var wikiEventsQueryURL = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvparse=&rvlimit=1&rvsection=1&indexpageids=&titles="+today.strDateQuery()+"&format=json&callback=getTodaysEvents";

// variable containing script element
var getWikiEventsScriptEl = $('<script>').attr("src", wikiEventsQueryURL);

$(document).on('ready', function() {
	// inject script to get events data from wikipedia via JSONP
  $('body').append(getWikiEventsScriptEl);
});