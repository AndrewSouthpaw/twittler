
/*
File: app.js
===============================================================================
Provides functionality to run Twittle site.

Created by: Andrew Smith
Release: 1.2
Date: 2014-11-02
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
var twitListFollowing = []  // list of Twits followed by user
var twitList = ["shawndrost", "sharksforcheap", "mracus", "douglascalhoun"]
  // dummy holder of all twits


/* Function: loadStream
===============================================================================
Loads a user's timeline into the Twittle stream.
*/

var loadStream = _.throttle(function(stream, username) {
  
  // Throttle to elegantly handle multiple concurrent calls to loadStream
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
      


}, 800);


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
    lastTweet = undefined;
    $('#twittle-stream').empty();
  };

  // Collect new tweets based on last displayed tweet
  var newTweets = 
    displayedStream.slice(_.indexOf(displayedStream, lastTweet) + 1);

  // Format and display each new tweet
  _.each(newTweets, function(tweet) {
    // If on home stream, only display Twits following
    if (displayedStream === streams.home && twitListFollowing.indexOf(tweet.user) === -1) {
      return;
    }
    var $twittle = formatTwittle(tweet);
    $twittle.prependTo($('#twittle-stream'));
    lastTweet = tweet;
  });

  // Truncate stream display to MAX_TWITTLES_DISPLAYED
  $('div.twittle').slice(MAX_TWITTLES_DISPLAYED).remove();

};


/* Function: loadUserTwitList
===============================================================================
Loads the list of Twits the user is following.
*/

var loadUserTwitList = function() {
  $('#panel-twit-list').empty();
  _.each(twitListFollowing, function(username) {
    var $html =
      $('<div class="panel panel-default"></div>')
        .append($('<div class="panel-body"></div>')
                  .text(" " + username)
                  .prepend($('<span class="glyphicon glyphicon-user"></span>'))
                  .append($('<span class="glyphicon glyphicon-ban-circle btn-stop-following-twit"' + 
                          'data-username="'+username+'" style="float:right;"' +
                          '</span>')));

    $html.find('.btn-stop-following-twit').click(function() {
      var username = $(this).data('username');
      stopFollowingTwit(username);
      $(this).parent().parent().remove();
    });
    $('#panel-twit-list').prepend($html);
    
  })
};


/* Function: stopFollowingTwit
===============================================================================
Removes the Twit from the list of Following, and refreshes the stream.
*/

var stopFollowingTwit = function(username) {
  var index = twitListFollowing.indexOf(username);
  if (index > -1) {
    twitListFollowing.splice(index, 1);
  }
  updateStream(true);
}


/* Function: followTwit
===============================================================================
Starts following a user-entered Twit, and refreshes the stream.
*/

var followTwit = function(username) {
  if (twitList.indexOf(username) === -1) {
    $('#form-follow-twit')
      .append($('<p class="text-danger" id="follow-twit-error"></p>')
              .text('User "' + username + '" does not exist.'));
    
    setTimeout(function() {
      $('#follow-twit-error').remove();
    }, 4000);
  } else if (twitListFollowing.indexOf(username) === -1) {
    twitListFollowing.push(username);
    loadUserTwitList();
    updateStream(true);
  } 
}


/* Function: buttonFollowTwit
===============================================================================
Button handler to Follow a new Twit
*/
var buttonFollowTwit = function() {
  var username = $('#form-follow-twit input').val();
  followTwit(username);
  $('#form-follow-twit input').val('');
}


/* DOM Ready
===============================================================================
*/

$(document).ready(function(){
  displayedStream = streams.home;
  twitListFollowing = ["shawndrost", "sharksforcheap", "mracus", "douglascalhoun"];
  loadUserTwitList();
  updateStream();
  setInterval(updateStream, 1000);  // pull in new tweets
  setInterval(function() {
    loadStream(displayedStream);
  }, 60000);  // reload stream contents to update relative times

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
  });

  // Event listener for input box to Follow Twit
  $('#form-follow-twit input').keyup(function(e) {
    if (e.keyCode === 13) {
      buttonFollowTwit();
    }
  });

  // Event listener for Follow button to Follow Twit
  $('#form-follow-twit button').click(buttonFollowTwit);

});