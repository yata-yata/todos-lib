// Load modules

// Add key placeholder for testing
var db = require('orchestrate')(process.env.orchestrateKey || 'key'),
    uuid = require('node-uuid'),

    // Declare internals
    internals = {};

module.exports = function(){};

module.exports.prototype.all = function(callback){
  db.list('todos')
    .then(function(response){
      callback(null, response.body.results.map(function(object){
        return {
          title: object.value.title,
          status: object.value.status,
          id: object.path.key
        };
      }));
    })
    .fail(function(err){
      callback(err);
    });
};

module.exports.prototype.get = function(id, callback){
  db.get('todos', id)
    .then(function(response){
      callback(null, {
        title: response.body.title,
        status: response.body.status,
        id: id
      });
    })
    .fail(function(err){
      callback(err);
    });
};

module.exports.prototype.create = function(model, callback){
  var id = this.createKey();

  db.put('todos', id, model)
    .then(function(response){
      callback(null, id);
    })
    .fail(function(err){
      callback(err);
    });
};

module.exports.prototype.update = function(id, model, callback){
  db.put('todos', id, model)
    .then(function(response){
      callback(null, id);
    })
    .fail(function(err){
      callback(err);
    });
};

module.exports.prototype.destroy = function(id, callback){
  db.remove('todos', id)
    .then(function(response){
      callback(null, null);
    })
    .fail(function(err){
      callback(err);
    });
};

module.exports.prototype.createKey = function(){
  return uuid.v1();
};
