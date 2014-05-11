// Load modules
var Todos = require('./persistence/todos'),

    // Declare internals
    internals = {};

module.exports = function(){
  this.todos = new Todos();
};

module.exports.prototype.get = function(options, callback){
  if(options.id){
    this.todos.get(options.id, options.user, callback);
  } else {
    this.todos.all(options.user, callback);
  }
};

module.exports.prototype.create = function(options, callback){
  this.todos.create(options.model, options.user, callback);
};

module.exports.prototype.update = function(options, callback){
  this.todos.update(options.id, options.model, options.user, callback);
};

module.exports.prototype.destroy = function(options, callback){
  this.todos.destroy(options.id, options.user, callback);
};

