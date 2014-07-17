// array of history event objects
var historyEventArr = [];
var NUMBER_OF_ANSWER_CHOICES = 4;

var pickIndexToCreateQuestion = function(){
	// set a random index value and check if a question has already been generated for for that event
	var eventIndex;
	do eventIndex = _.random(historyEventArr.length)
	while (historyEventArr[eventIndex].attemptedQuestion);
	// set the attempted value to true, and return that index value to create question function
	historyEventArr[eventIndex].attemptedQuestion = true;
	return getStartingIndexAndRange(eventIndex);
}




// create string with today's date for article title parameter in wikipedia query
var today = new Date();

var strDateQuery = function(dateObj){
	var monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var month = dateObj.getMonth();
	return createWikiEventsScript(monthsArr[month]+'%20'+dateObj.getDate()+'');
}
// constructor for history event objects
var HistoryEvent = function (eventStr, year){
	this.eventStr = eventStr;
	this.year = year;
	this.score = 4;
	this.attemptedQuestion = false;
}



var getSameYearCount = function(startingIndex){
	// iterate through events with higher index than startingIndex and check for same year value, 
	var sameYearCount = 0;
	for (var i=startingIndex; i<startingIndex + NUMBER_OF_ANSWER_CHOICES; i++){
		// if the year value is the same, increment sameYearCount
		if (historyEventArr[i].year === historyEventArr[i+1].year){
			sameYearCount++;
		}
	}
	return sameYearCount;
}

var getStartingIndexAndRange = function(historyEventIndex){
	// determine starting point for question choices in array
	var startingIndex = _.random(-NUMBER_OF_ANSWER_CHOICES, NUMBER_OF_ANSWER_CHOICES) + historyEventIndex;

	// make sure starting index for events in guessYear question are within array range
	if (startingIndex < 0){
		startingIndex = 0;
	}if (startingIndex > historyEventArr.length - NUMBER_OF_ANSWER_CHOICES){
		startingIndex = historyEventArr.length - NUMBER_OF_ANSWER_CHOICES;
	}
	// if the range of year choices after accounting for duplicate years (sameYearCount)is greater than the length of the array, decrease the starting index to remain within range of array
	var sameYearCount = getSameYearCount(startingIndex);
	while (startingIndex + NUMBER_OF_ANSWER_CHOICES-1 + sameYearCount >= historyEventArr.length){
		startingIndex -= sameYearCount;
	}return createGuessYearArr(startingIndex, startingIndex + NUMBER_OF_ANSWER_CHOICES + sameYearCount);
}

var createGuessYearArr = function(startingIndex, questionRange){
	var guessYearArr = [];
	for (var i = startingIndex; i <questionRange; i++){
		if (i==startingIndex || (historyEventArr[i].year != historyEventArr[i-1].year)) {
			guessYearArr.push(historyEventArr[i].year);
		}
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

// check if character in string is a number (char codes 48 - 57 ==> 0-9)
var testIfCharIsNum = function(str, index){
	return (str.charCodeAt(index)>47 && str.charCodeAt(index)<58);
}

var parseYearFromScrapedEventString = function(scrapedEventStr){
	var yearStr = '';
	// loop through each character in scraped text
	for (var i=0; i < scrapedEventStr.length; i++){
			// check if character is a number (char codes 48 - 57 ==> 0-9)		
		if (testIfCharIsNum(scrapedEventStr, i)) {
			// if character is a number, add it to the year string
			yearStr += scrapedEventStr.charAt(i);
			// check if next character is not a number (if not, year value is complete and break out of the loop for this <li>) year, or break out of making year string
			if (!(testIfCharIsNum(scrapedEventStr, i+1))){
				// if the next character is not a number, check if it's a BC year
				if ((scrapedEventStr.charAt(i+2)=='B') && (scrapedEventStr.charAt(i+3)=='C')) {
					// if it's a BC year, add BC to the year value before breaking out of the loop for this <li>
					yearStr += ' BC';
					break;
				}
				// end loop for this <li> if year value is complete
				break; 
			}
		}
	}return yearStr;
}

var parseEventsHTMLIntoObjects = function(listOfEvents){
	// loop through each event <li>
	for (var i=0; i < listOfEvents.length; i++){
		var scrapedEventStr = listOfEvents.eq(i).text();
		var yearStr = parseYearFromScrapedEventString(scrapedEventStr);
		// parse string version of events
		var eventStr = scrapedEventStr.slice(yearStr.length + 3);
		// create new HistoryEvent object using year string and event string
		var newHistoryEvent = new HistoryEvent(eventStr, yearStr);
		// push new HistoryEvent object to array containing HistoryEvents
		historyEventArr.push(newHistoryEvent);
	}
}

$(document).on('ready', function() {
	// inject JSONP script to get events data from wikipedia
  $('body').append(strDateQuery(today));
});