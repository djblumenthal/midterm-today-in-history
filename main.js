// array of history event objects
var historyEventArr = [];
var pickIndexToCreateQuestion = function(){
	// set a random index value and check if a question has already been generated for for that event
	var eventIndex;
	do eventIndex = _.random(historyEventArr.length)
	while (historyEventArr[eventIndex].attemptedQuestion);
	// set the attempted value to true, and return that index value to create question function
	historyEventArr[eventIndex].attemptedQuestion = true;
	return eventIndex;
}


// track which questions have already been asked


// create string with today's date for article title parameter in wikipedia query
var today = new Date();

// add it as helper function, not on prototype
Date.prototype.strDateQuery = function(){
	var monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var month = today.getMonth();
	return createWikiEventsScript(monthsArr[month]+'%20'+today.getDate()+'');
}
// constructor for history event objects
var HistoryEvent = function (eventStr, year){
	this.eventStr = eventStr;
	this.year = year;
	this.score = 4;
	this.attemptedQuestion = false;
}

// HistoryEvent method to push HistoryEvent object to array
HistoryEvent.prototype.pushToArr = function(){
	historyEventArr.push(this);
}

// create guess year object

HistoryEvent.prototype.guessYear = function(historyEventIndex){
	// determine starting point for question choices in array
	var startingIndex = _.random(-3, 3) + historyEventIndex;
	// declare variable sameYearCount to track how many events after historyEvent happened in the same year
	var sameYearCount = 0;
	// make sure starting index for events in guessYear question are within array range
	if (startingIndex < 0){
		startingIndex = 0;
	}if (startingIndex > historyEventArr.length - 4){
		startingIndex = historyEventArr.length - 4;
	}

	// iterate through events with higher index than startingIndex and check for same year value, 
	for (var i=startingIndex; i<startingIndex+4; i++){
		// if the year value is the same, increment sameYearCount
		if (historyEventArr[i].year === historyEventArr[i+1].year){
			sameYearCount++;
		}
	}
	// if the range of year choices after accounting for duplicate years is greater than the length of the length of the array, decrease the starting index to remain within range of array
	if (startingIndex + 3 + sameYearCount >= historyEventArr.length){
		startingIndex -= sameYearCount;
	}
}


// create URL used to query wikipedia
var createWikiEventsScript = function(dateValueForQuery){
	return createScriptEl("http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvparse=&rvlimit=1&rvsection=1&indexpageids=&titles="+dateValueForQuery+"&format=json&callback=getTodaysEvents");
}

// create script element for JSONP query of Wikipedia
var createScriptEl = function(queryURL){
	return $('<script>').attr("src", queryURL);
}

// callback executed during query of Wikipedia, returning events html from wikipedia query object
var getTodaysEvents = function(wikiQueryData){
	// get pageID for use in extracting content for any date
	var pageID = wikiQueryData.query.pageids[0];
	// extract events content
	var todaysEventsRawHTML = wikiQueryData.query.pages[pageID].revisions[0]['*'];
	// pass raw events html to a container div
	var todaysEventsContainer = $('<div class="todays-events-container">').html(todaysEventsRawHTML)
	// append todaysEventsContainer to the main content div, and hide from page view
	$('.container').append(todaysEventsContainer);
	$(todaysEventsContainer).hide();
	// create selector to select all event list items in events HTML, & pass to parseEventsHTMLIntoObjects
	var eventListItems = $('.todays-events-container > ul li');
	return parseEventsHTMLIntoObjects(eventListItems);
}


var parseEventsHTMLIntoObjects = function(listOfEvents){
	// loop through each event <li>
	for (var i=0; i < listOfEvents.length; i++){
		// declare a yearStr variable for year of each event <li>
		var yearStr = '';
		// loop through each character in <li> text
		for (var j=0; j < listOfEvents.eq(i).text().length; j++){
			// check if character is a number (char codes 48 - 57 ==> 0-9)
			if (listOfEvents.eq(i).text().charCodeAt(j)>47 && listOfEvents.eq(i).text().charCodeAt(j)<58) {
				// if character is a number, add it to the year string
				yearStr += listOfEvents.eq(i).text().charAt(j);
				// check if next character is not a number (if not, year value is complete and break out of the loop for this <li>) year, or break out of making year string
				if (!(listOfEvents.eq(i).text().charCodeAt(j+1)>47 && listOfEvents.eq(i).text().charCodeAt(j+1)<58)) {
					// if the next character is not a number, check if it's a BC year
					if ((listOfEvents.eq(i).text().charAt(j+2)=='B') && (listOfEvents.eq(i).text().charAt(j+3)=='C')) {
						// if it's a BC year, add BC to the year value before breaking out of the loop for this <li>
						yearStr += ' BC';
						break;
					}
					// end loop for this <li> if year value is complete
					break; 
				}
			}
		}
		// parse string version of events
		var eventStr = listOfEvents.eq(i).text().slice(yearStr.length + 3);
		// create new HistoryEvent object using year string and event string
		var newHistoryEvent = new HistoryEvent(eventStr, yearStr);
		// push new HistoryEvent object to array containing HistoryEvents
		newHistoryEvent.pushToArr();
	}
}


$(document).on('ready', function() {
	// inject JSONP script to get events data from wikipedia
  $('body').append(today.strDateQuery());
});