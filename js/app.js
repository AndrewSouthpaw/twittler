
/*
File: app.js
===============================================================================
Provides functionality to run Twittle site.
*/


/* Constants
===============================================================================
*/
var MAX_TWITTLES_DISPLAYED = 20;

/*
Global variables
===============================================================================
*/
var lastTweet;  // tracks most recent Twittle displayed in stream
var displayedStream;  // stream currently being displays


/* Function: formatTwittle
===============================================================================
Takes a tweet object, formats it to display in HTML. Returns a formatted
jQuery Twittle object.
*/
var formatTwittle = function(tweet) {
  var $twittle = $('<div class="twittle"></div>');
  $twittle.append($('<div class="message">').text('@' + tweet.user + ': ' + tweet.message))
          .append($('<div class="timedisplay">').text(tweet.created_at));
  return $twittle;
};


/* Function: updateStream
===============================================================================
Checks for new tweets in the displayed stream. If present, formats these for
display on the stream, and displays them. Only displays most recent 
MAX_TWITTLES_DISPLAYED twittles.
*/
var updateStream = function() {
  var newTweets = 
    displayedStream.slice(_.indexOf(displayedStream, lastTweet) + 1);

  _.each(newTweets, function(tweet) {
    var $twittle = formatTwittle(tweet);
    $twittle.prependTo($('body'));
    lastTweet = tweet;
  });

  $('div.twittle').slice(MAX_TWITTLES_DISPLAYED).remove();

};



/* DOM Ready
===============================================================================
*/

$(document).ready(function(){
  var $body = $('body');
  $body.html('');
  displayedStream = streams.home;
  updateStream();
  // setInterval(updateStream, 1000);

});