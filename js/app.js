
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


/* Function: loadStream
===============================================================================
Loads a user's timeline into the Twittle stream.
*/

var loadStream = function(stream, username) {
  
  // Throttle to elegantly handle multiple concurrent calls to loadStream
  var throttled = _.throttle(function() {
      console.log('throttled');
      var isSameStream = displayedStream === stream;
  
      if (isSameStream) { return updateStream(true); };
  
      // Disappear the stream to change the stream contents
      if (!isSameStream) {
        $('#twittle-stream').fadeOut();
      }
  
      displayedStream = stream;
      // Update stream contents after disappear animation finishes
      setTimeout(function() {
        if (displayedStream === streams.home) {
          $('#twittle-stream-username').text('Twittle Stream');
          $('#twittle-stream-home-btn').hide();
        } else {
          $('#twittle-stream-username').text(username + "'s Twittle Stream");
          $('#twittle-stream-home-btn').show();
        }
        updateStream(true);
      }, 400);
  
      // Reappear stream
      if (!isSameStream) {
        setTimeout(function() {
          // Reappear the stream
          $('#twittle-stream').fadeIn();
        }, 400);
      }
      
    }, 4000, {trailing: false});

throttled();

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
            .append($('<div class="timedisplay">').text(moment(tweet.created_at).fromNow()))
            );

  // $twittle.find('a').click(loadStream.bind(null, streams.users[tweet.user], 
  //                          $(this).text().slice(1)));
  $twittle.find('a').click(function() {
    loadStream(streams.users[tweet.user], tweet.user);
  })
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
    console.log('new display');
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
  setInterval(function() {
    loadStream(displayedStream);
  }, 3000);

  // Event listener to create Twittle
  $('#btn-create-twittle').click(function() {
    var msg = $('#text-create-twittle').val();
    writeTweet(msg);
    $('#text-create-twittle').val('');
    updateStream();
  })

  // Event listener for Home button on Twittle Stream
  $('#twittle-stream-home-btn').click(function() {
    loadStream(streams.home, "");
    
  })

});