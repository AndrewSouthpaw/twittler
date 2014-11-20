

var TwittleModel = Backbone.Model.extend({
  defaults: {
    author: 'anonymous',
    text: 'default text'
  }
});

var TwittleView = Backbone.View.extend({
  className: 'twittleView',
  template: _.template("<span>User: <%= user %><br><%= message %><br><%= created_at %></span>"), 
  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
    this.model.on('hide', this.remove, this);
  },
  remove: function() {
    this.$el.remove();
  },
  render: function(){
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

var Twittles = Backbone.Collection.extend({
  model: TwittleModel,
  initialize: function() {
    this.on('remove', this.hideModel, this);
  },

  hideModel: function(model) {
    model.trigger('hide');
  }
});

var TwittlesView = Backbone.View.extend({
  className: 'twittlesView',
  initialize: function() {
    this.collection.on('change', this.render, this);
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.render, this);
  },
  render: function() {
    this.$el.empty();
    this.collection.forEach(this.addOne, this);
  },

  addOne: function(model) {
    var view = new TwittleView({model: model});
    this.$el.append(view.render().el);
  }
});

var twittles = new Twittles({});
var twittlesView = new TwittlesView({collection: twittles});



$('document').ready(function() {
  $('#place').append(twittlesView.el);
  twittles.reset(streams.home);
  setInterval(function() {
    twittles.reset(streams.home);
  }, 1000)
})