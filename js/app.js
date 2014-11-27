
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
var App = {    // contains Backbone info
  Models: {},
  Views: {},
  Collections: {}
};  


/******************************************************************************
Twittle Backbone
******************************************************************************/



/* Model: Twittle
===============================================================================
Contains data for a Twittle */
App.Models.Twittle = Backbone.Model.extend({
});


/* View: Twittle
===============================================================================
Provides view for Twittle */

App.Views.Twittle = Backbone.View.extend({
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
      twittles.loadStream(streams.users[username], username);
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


/* Collection: Twittles
===============================================================================
Collection of Twittles */

App.Collections.Twittles = Backbone.Collection.extend({
  model: App.Models.Twittle,
  initialize: function() {
    this.on('remove', this.hideModel, this);
  },

  hideModel: function(model) {
    model.trigger('hide');
  },

  addTwittle: function(twittle) {
    this.add(twittle);
    if (this.length > MAX_TWITTLES_DISPLAYED) {
      this.remove(this.at(0));
    }
  },

  updateStream: function(isNewDisplay) {
    // Update current stream with latest twittles
    // Reset 'last tweet' if displaying a new timeline
    if (isNewDisplay) {
      lastTweet = undefined;
      this.reset([]);
    };

    // Collect new tweets based on last displayed tweet
    var newTweets = 
      displayedStream.slice(isNewDisplay 
                            ? -MAX_TWITTLES_DISPLAYED
                            : _.indexOf(displayedStream, lastTweet) + 1
                            );

    // Format and display each new tweet
    _.each(newTweets, function(tweet) {
      // If on home stream, only display Twits following
      if ((displayedStream === streams.home && 
          !_.contains(twitsFollowing.pluck('username'), tweet.user) &&
          tweet.user !== visitor)) {
        return;
      }

      this.addTwittle(tweet);
      lastTweet = tweet;
    }, this);

  },

  loadStream: _.throttle(function(stream, username) {
    // Completely reloads a stream
    if (displayedStream === stream) return this.updateStream(true);

    // Disappear the stream to change the stream contents
    $('#twittle-stream').fadeOut();

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
      twittles.updateStream(true);
    }, 400);

    // Reappear stream
    setTimeout(function() {
      // Reappear the stream
      $('#twittle-stream').fadeIn();
    }, 400);
  }, 800)


});


/* View: Twittles
===============================================================================
CollectionView for Twittles */

App.Views.Twittles = Backbone.View.extend({
  className: 'twittlesView',
  initialize: function() {
    this.collection.on('change', this.render, this);
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.render, this);
    this.collection.loadStream(streams.home);
    $('#twittle-stream').append(this.render().el);

    /* Regularly check for new twittles */
    setInterval(function() {
      twittles.updateStream();
    }, 1000);
    /* Reload stream contents to update relative times */
    setInterval(function() {
      twittles.loadStream(displayedStream);
    }, 60000); 
  },



  render: function() {
    this.$el.empty();
    this.collection.forEach(this.addOne, this);
    return this;
  },

  addOne: function(model) {
    var view = new App.Views.Twittle({model: model});
    this.$el.prepend(view.render().el);
  }
});










/******************************************************************************
TwitsFollowing Backbone
******************************************************************************/

/* Model: Twit
===============================================================================
To track users following */
App.Models.Twit = Backbone.Model.extend({

});

/* View: TwitFollowing
===============================================================================
View for following a twit */
App.Views.TwitFollowing = Backbone.View.extend({
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
      this.stopFollowingTwit();
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

  stopFollowingTwit: function() {
    // Removes the Twit from the list of Following, and refreshes the stream.
    this.remove(this);
    this.model.trigger('hide');
    this.model.destroy();
    twittles.updateStream(true);  
  }
});

/* Collection: TwitsFollowing
===============================================================================
Contains all the twits being followed */
App.Collections.TwitsFollowing = Backbone.Collection.extend({
  model: App.Models.Twit,
  loadUserTwitList: function(){
    this.reset([]);
    twitListFollowing.forEach(function(username) {
      this.add({username: username});
    }, this);
  },
});


/* Collection View: TwitsFollowing
===============================================================================
Collection view for twits being followed */
App.Views.TwitsFollowing = Backbone.View.extend({
  className: 'twitsFollowingView',
  initialize: function(){
    this.collection.on('change', this.render, this);
    this.collection.on('add', function() {
      this.render();
      twittles.updateStream(true);
    }, this);
    this.collection.loadUserTwitList();
    $('#panel-twit-list').prepend(this.render().el);
  },

  render: function(){
    this.$el.empty();
    this.collection.forEach(function(model) {
      var view = new App.Views.TwitFollowing({model: model});
      this.$el.append(view.render().el);
    }, this);
    return this;
  },
});




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
    var twit = new App.Models.Twit({username: username});
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


/******************************************************************************
DOM Ready
******************************************************************************/

$(document).ready(function(){

  displayedStream = streams.home;

  /* Set up Twittles stream */
  twittles = new App.Collections.Twittles({});
  
  /* Load initial staging of twits following */
  twitListFollowing = ["shawndrost", "sharksforcheap", "mracus", "douglascalhoun"];
  twitsFollowing = new App.Collections.TwitsFollowing({});

  /* Create views */
  twitsFollowingView = new App.Views.TwitsFollowing({collection: twitsFollowing});
  twittlesView = new App.Views.Twittles({collection: twittles});

  // Event listener to create Twittle
  $('#btn-create-twittle').click(function() {
    var msg = $('#text-create-twittle').val();
    writeTweet(msg);
    $('#text-create-twittle').val('');
    twittles.updateStream();
  })

  // Event listener for Home button on Twittle Stream
  $('#twittle-stream-home-btn').click(function() {
    twittles.loadStream(streams.home, "");
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
    twittles.updateStream(true);
  })


});