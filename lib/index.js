// Load modules
var Todos = require('./persistence/todos'),

    // Declare internals
    internals = {};

module.exports = function(){
  this.todos = new Todos();
};

module.exports.prototype.get = function(options, callback){
  if(options){
    this.todos.get(options.id, callback);
  } else {
    this.todos.all(callback);
  }
};

module.exports.prototype.create = function(model, callback){
  this.todos.create(model, callback);
};

module.exports.prototype.update = function(options, callback){
  this.todos.update(options.id, options.model, callback);
};

module.exports.prototype.destroy = function(options, callback){
  this.todos.destroy(options.id, callback);
};

