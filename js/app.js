
/*
File: app.js
===============================================================================
Provides functionality to run Twittle site.

Created by: Andrew Smith
Release: 1.0
Date: 2014-11-01
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
var visitor = "me";   // dummy variable for name of user
streams.users[visitor] = [];


/* Function: loadUserTimeline
===============================================================================
Loads a user's timeline into the Twittle stream.
*/

var loadUserTimeline = function() {
  var username = $(this).text().slice(1);

  // Disappear the stream to change the stream contents
  $('#twittle-stream').fadeOut();

  setTimeout(function() {
    // Update stream contents
    if (username === "") {
      displayedStream = streams.home;
      $('#twittle-stream-username').text('Twittle Stream');
    } else {
      displayedStream = streams.users[username];
      $('#twittle-stream-username').text(username + "'s Twittle Stream");
      $('#twittle-stream-home-btn').show();
    }
    updateStream(true);
  }, 400);

  setTimeout(function() {
    // Reappear the stream
    $('#twittle-stream').fadeIn();
  }, 400);
};


/* Function: formatTwittle
===============================================================================
Takes a tweet object, formats it to display in HTML. Returns a formatted
jQuery Twittle object.
*/
var formatTwittle = function(tweet) {
  var $twittle = 
    $('<div class="twittle panel panel-default"></div>')
    .append($('<div class="panel-body"></div>')
            .append($('<div class="username">')
                    .append($('<a></a>').text('@' + tweet.user)))
            .append($('<div class="message">').text(tweet.message))
            .append($('<div class="timedisplay">').text(tweet.created_at))
            );

  $twittle.find('a').click(loadUserTimeline);
  return $twittle;
};



/* Function: updateStream
===============================================================================
Checks for new tweets in the displayed stream. If present, formats these for
display on the stream, and displays them. Only displays most recent 
MAX_TWITTLES_DISPLAYED twittles.
*/
var updateStream = function(isNewDisplay) {
  // Reset 'last tweet' if displaying a new timeline
  if (isNewDisplay) {
    lastTweet = undefined;
    $('#twittle-stream').empty();
  };

  // Collect new tweets based on last displayed tweet
  var newTweets = 
    displayedStream.slice(_.indexOf(displayedStream, lastTweet) + 1);

  // Format and display each new tweet
  _.each(newTweets, function(tweet) {
    var $twittle = formatTwittle(tweet);
    $twittle.prependTo($('#twittle-stream'));
    lastTweet = tweet;
  });

  // Truncate stream display to MAX_TWITTLES_DISPLAYED
  $('div.twittle').slice(MAX_TWITTLES_DISPLAYED).remove();

};



/* DOM Ready
===============================================================================
*/

$(document).ready(function(){
  displayedStream = streams.home;
  updateStream();
  setInterval(updateStream, 1000);

  // Event listener to create Twittle
  $('#btn-create-twittle').click(function() {
    var msg = $('#text-create-twittle').val();
    writeTweet(msg);
    $('#text-create-twittle').val('');
    updateStream();
  })

  // Event listener for Home button on Twittle Stream
  $('#twittle-stream-home-btn').click(function() {
    loadUserTimeline();
    $(this).fadeOut();
  })

});