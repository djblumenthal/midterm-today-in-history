# midterm-today-in-history

Today in History is a history trivia game that asks a player when a historical event happened.  Historical events are drawn from wikipedia articles for a given day of the year, the html for the article is pulled in via wikimedia api, scraped for the event description and year, and rerendered into multiple choice trivia questions.

No data is persisted, and the app is run entirely in a single page with AJAX to get information and re-render content and elements without a page reload.

Tech stack: JavaScript, jQuery, AJAX, HTML5, CSS3, Jade
