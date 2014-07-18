// array of history event objects
var historyEventArr = [];
var NUMBER_OF_ANSWER_CHOICES = 4;

var StatsObj = function(){
	this.totalAttempted = 0;
	this.totalPoints = 0;
}

StatsObj.prototype.averagePerformance = function(){
	return this.totalPoints/(this.totalAttempted);
}

var userStats = new StatsObj();

var pickIndexToCreateQuestion = function(){
	// set a random index value and check if a question has already been generated for for that event
	var eventIndex;
	do eventIndex = _.random(historyEventArr.length-1)
	while (historyEventArr[eventIndex].attemptedQuestion);
	// set the attempted value to true, and return that index value to create question function
	// console.log(eventIndex);
	historyEventArr[eventIndex].attemptedQuestion = true;
	userStats.totalAttempted++;
	// console.log(" year: "+ historyEventArr[eventIndex].year + " event: " + historyEventArr[eventIndex].eventStr);
	var eventEl = $('<div>').addClass('col-sm-12 history-event').text(historyEventArr[eventIndex].eventStr).attr('data-eventyear', historyEventArr[eventIndex].year).attr('data-eventindex', eventIndex);
	$('#events-row').append(eventEl);
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
	for (var i=startingIndex+1; i<startingIndex + NUMBER_OF_ANSWER_CHOICES; i++){
		// if the year value is the same, increment sameYearCount
		if (historyEventArr[i].year === historyEventArr[i-1].year){
			sameYearCount++;
		}
	}
	return sameYearCount;
}

var getStartingIndexAndRange = function(historyEventIndex){
	// determine starting point for question choices in array
	var startingIndex = historyEventIndex - _.random(NUMBER_OF_ANSWER_CHOICES-1);

	// make sure starting index for events in guessYear question are within array range
	if (startingIndex < 0){
		startingIndex = 0;
	}if (startingIndex > historyEventArr.length - NUMBER_OF_ANSWER_CHOICES){
		startingIndex = historyEventArr.length - NUMBER_OF_ANSWER_CHOICES;
	}
	// if the range of year choices after accounting for duplicate years (sameYearCount)is greater than the length of the array, decrease the starting index to remain within range of array
	var sameYearCount = getSameYearCount(startingIndex);
	while (startingIndex + NUMBER_OF_ANSWER_CHOICES-1 + sameYearCount >= historyEventArr.length){
		startingIndex --;
	}return createGuessYearArr(startingIndex);
}

var createGuessYearArr = function(startingIndex){
	var guessYearArr = [];
	for (var i = startingIndex; i <historyEventArr.length; i++){
		if (guessYearArr.length === NUMBER_OF_ANSWER_CHOICES){
			break;
		}
		if (i==startingIndex || (historyEventArr[i].year != historyEventArr[i-1].year)) {
			guessYearArr.push(historyEventArr[i].year);
		}
	}return renderGuessYearArr(guessYearArr);
}

var renderGuessYearArr = function (arr){
	for (var i=0; i<arr.length; i++){
		var yearEl = $('<div>').addClass('col-sm-12 year-choice').attr('id', 'choice'+i).text(arr[i]);
		$('#dates-row').append(yearEl);
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
	$('.container').after(todaysEventsContainer);
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

var clickedAnswer = function(){
	if ($(this).text() === $('.history-event').attr('data-eventyear')){
		return clickedCorrectAnswer(this);
	}else if(!($(this).text() === $('.history-event').attr('data-eventyear'))) {
		return clickedWrongAnswer(this);
	}
}

var clickedCorrectAnswer = function(el){
	$('#dates-row').off('click', '.year-choice', clickedAnswer);
	console.log('correct!');
	$(el).css('background-color', 'rgb(39, 174, 96)');
	console.log(historyEventArr[$('.history-event').attr('data-eventindex')].score);
	userStats.totalPoints += historyEventArr[$('.history-event').attr('data-eventindex')].score;
	$('#events-row').append('<button type="button" class="btn btn-primary" id="next-question">Next Question!</button>');
	$('#next-question').on('click', function(){
		$('#dates-row').empty();
		$('#events-row').empty();
		pickIndexToCreateQuestion();
		$('#dates-row').on('click', '.year-choice', clickedAnswer);
	});
}

var clickedWrongAnswer = function(el){
	console.log('Wrong');
  	$(el).css('background-color', 'rgb(192, 57, 43)');
  	$(el).click(false);
  	if (historyEventArr[$('.history-event').attr('data-eventindex')].score===4){
		historyEventArr[$('.history-event').attr('data-eventindex')].score=2;
	}else if (historyEventArr[$('.history-event').attr('data-eventindex')].score===2){
		historyEventArr[$('.history-event').attr('data-eventindex')].score=1;
	}else if (historyEventArr[$('.history-event').attr('data-eventindex')].score===1){
		historyEventArr[$('.history-event').attr('data-eventindex')].score=0;
		$('#dates-row').off('click', '.year-choice', clickedAnswer);
		
		$('#events-row').append('<button type="button" class="btn btn-primary" id="next-question">Next Question!</button>');
		$('#next-question').on('click', function(){
			$('#dates-row').empty();
			$('#events-row').empty();
			pickIndexToCreateQuestion();
			$('#dates-row').on('click', '.year-choice', clickedAnswer);
		});
	}console.log(historyEventArr[$('.history-event').attr('data-eventindex')].score);
}

$(document).on('ready', function() {
	// inject JSONP script to get events data from wikipedia
  $('body').append(strDateQuery(today));
  setTimeout(pickIndexToCreateQuestion, 3000);
  $('#dates-row').on('click', '.year-choice', clickedAnswer);

  		
 });
