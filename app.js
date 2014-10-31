
/*
File: app.js
===============================================================================
Provides functionality to run Twittle site.
*/



/* Function: formatTwittle
===============================================================================
Takes a tweet object, formats it to display in HTML. Returns a formatted
jQuery object.
*/


var formatTwittle = function(tweet) {
  var $tweet = $('<div></div>');
  $tweet.text('@' + tweet.user + ': ' + tweet.message);
  return $tweet;
};





/* DOM Ready
===============================================================================
*/

$(document).ready(function(){
  var $body = $('body');
  $body.html('');

  var index = streams.home.length - 1;
  while(index >= 0){
    var tweet = streams.home[index];
    var $twittle = formatTwittle(tweet);
    $twittle.appendTo($body);
    index -= 1;
  }

});