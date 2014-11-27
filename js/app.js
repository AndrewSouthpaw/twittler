
/*
File: app.js
===============================================================================
Provides functionality to run Twittle site.

Created by: Andrew Smith
Release: 2.0
Date: 2014-11-23
*/


/* Constants
===============================================================================
*/
var MAX_TWITTLES_DISPLAYED = 10;

/*
Global variables
===============================================================================
*/
var lastTweet;  // tracks most recent Twittle displayed in stream
var displayedStream;  // stream currently being displays
var visitor = "me";   // dummy variable for name of user
streams.users[visitor] = [];
var twitListFollowing = [];  // list of Twits followed by user
var twitList = [visitor, "shawndrost", "sharksforcheap", "mracus", "douglascalhoun"];
  // dummy holder of all twits
var twittles;
var twittlesView;
var twitsFollowing;
var twitsFollowingView;



/******************************************************************************
Twittle Backbone
******************************************************************************/



/*
TwittleModel
===============================================================================
Contains data for a Twittle
*/
var TwittleModel = Backbone.Model.extend({
});


/*
TwittleView
===============================================================================
Provides view for TwittleModel
*/

var TwittleView = Backbone.View.extend({
  className: 'twittle panel panel-default twittleView',
  tagName: 'div',
  template: 
    _.template('<div class="panel-body">' +
               '  <div class="username"><a>@<%= model.escape("user") %></a></div>' +
               '  <div class="message"><%= model.escape("message") %></div>' +
               '  <div class="timedisplay">' +
               '    <% print(moment(model.get("created_at")).fromNow()) %>' +
               '  </div>' +
               '</div>'), 

  events: {
    'click a': function() {
      var username = this.model.get('user');
      loadStream(streams.users[username], username);
    }
  },

  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
    this.model.on('hide', this.remove, this);
  },
  remove: function() {
    this.$el.remove();
  },
  render: function(){
    this.$el.html(this.template({model: this.model}));
    return this;
  }
});


/* Twittles
===============================================================================
Collection of TwittleModels
*/

var Twittles = Backbone.Collection.extend({
  model: TwittleModel,
  initialize: function() {
    this.on('remove', this.hideModel, this);
  },

  hideModel: function(model) {
    model.trigger('hide');
  },

  loadStream: function(stream) {
    this.reset([]);
    stream.forEach(this.addTwittle, this);
  },

  addTwittle: function(twittle) {
    this.add(twittle);
    if (this.length > MAX_TWITTLES_DISPLAYED) {
      this.remove(this.at(0));
    }
  }
});


/* TwittlesView
===============================================================================
CollectionView for Twittles
*/

var TwittlesView = Backbone.View.extend({
  className: 'twittlesView',
  initialize: function() {
    this.collection.on('change', this.render, this);
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.render, this);
    this.collection.loadStream(streams.home);
    displayedStream = streams.home;
    $('#twittle-stream').append(this.render().el);
  },



  render: function() {
    this.$el.empty();
    this.collection.forEach(this.addOne, this);
    return this;
  },

  addOne: function(model) {
    var view = new TwittleView({model: model});
    this.$el.prepend(view.render().el);
  }
});










/******************************************************************************
TwitsFollowing Backbone
******************************************************************************/

var TwitModel = Backbone.Model.extend({});

var TwitFollowingView = Backbone.View.extend({
  tagName: 'div',
  className: 'panel panel-default',
  template:
    _.template('<div class="panel-body">' +
               '  <span class="glyphicon glyphicon-user"></span>' +
               '  <%= model.escape("username") %>' +
               '  <span class="glyphicon glyphicon-ban-circle' + 
               '   btn-stop-following-twit"' +
               '   style="float:right;"></span>' +
               '</div>'),
  events: {
    "click span.glyphicon-ban-circle": function() {
      stopFollowingTwit(this.model);
      this.model.trigger('hide');
      this.model.destroy();
    }, 
  }, 

  initialize: function(){
    this.model.on('hide', this.remove, this);
  },

  render: function(){
    this.$el.html(this.template({model: this.model}));
    return this;
  },

  remove: function(){
    this.$el.remove();
  },
});


var TwitsFollowing = Backbone.Collection.extend({
  model: TwitModel,
  loadUserTwitList: function(){
    this.reset([]);
    twitListFollowing.forEach(function(username) {
      this.add({username: username});
    }, this);
  },
});



var TwitsFollowingView = Backbone.View.extend({
  className: 'twitsFollowingView',
  initialize: function(){
    this.collection.on('change', this.render, this);
    this.collection.on('add', function() {
      this.render();
      updateStream(true);
    }, this);
  },

  render: function(){
    this.$el.empty();
    this.collection.forEach(function(model) {
      var view = new TwitFollowingView({model: model});
      this.$el.append(view.render().el);
    }, this);
    return this;
  },
});







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



/* Function: updateStream
===============================================================================
Checks for new tweets in the displayed stream and displays them.
*/
var updateStream = function(isNewDisplay) {
  // Reset 'last tweet' if displaying a new timeline
  if (isNewDisplay) {
    lastTweet = undefined;
    twittles.reset([]);
  };

  // Collect new tweets based on last displayed tweet
  var newTweets = 
    displayedStream.slice(_.indexOf(displayedStream, lastTweet) + 1);

  // Format and display each new tweet
  _.each(newTweets, function(tweet) {
    // If on home stream, only display Twits following
    if ((displayedStream === streams.home && 
        !_.contains(twitsFollowing.pluck('username'), tweet.user) &&
        tweet.user !== visitor)) {
      return;
    }

    twittles.addTwittle(tweet);
    lastTweet = tweet;
  });

};




/* Function: stopFollowingTwit
===============================================================================
Removes the Twit from the list of Following, and refreshes the stream.
*/

var stopFollowingTwit = function(user) {
  twitsFollowing.remove(user);
  updateStream(true);  
}


/* Function: followTwit
===============================================================================
Starts following a user-entered Twit, and refreshes the stream.
*/

var followTwit = function(username) {
  // Display error if user does not exist
  if (!_.contains(twitList, username)) {
    $('#form-follow-twit')
      .append($('<p class="text-danger" id="follow-twit-error"></p>')
              .text('User "' + username + '" does not exist.'));
    
    // Remove error after set duration
    setTimeout(function() {
      $('#follow-twit-error').remove();
    }, 4000);

  // Add user
  } else if (!_.contains(twitsFollowing.pluck('username'), username)) {
    var twit = new TwitModel({username: username});
    twitsFollowing.add(twit);
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
  /* Set up Twittles stream */
  twittles = new Twittles({});
  twittlesView = new TwittlesView({collection: twittles});

  
  /* Load initial staging of twits following */
  twitListFollowing = ["shawndrost", "sharksforcheap", "mracus", "douglascalhoun"];
  twitsFollowing = new TwitsFollowing({});
  twitsFollowing.loadUserTwitList();
  twitsFollowingView = new TwitsFollowingView({collection: twitsFollowing});
  $('#panel-twit-list').prepend(twitsFollowingView.render().el);

  /* Regularly update stream */
  setInterval(function() {
    updateStream();
  }, 1000);
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

  // Listener for Twittle display limit
  $('#select-twittle-display-limit').change(function() {
    MAX_TWITTLES_DISPLAYED = $(this).val();
    updateStream(true);
  })


});