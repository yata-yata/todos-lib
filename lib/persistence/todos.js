// Load modules

// Add key placeholder for testing
var db = require('orchestrate')(process.env.orchestrateKey || 'key'),
    _ = require('lodash'),
    uuid = require('node-uuid'),

// Declare internals
internals = {};

module.exports = function(){};

module.exports.prototype.all = function(user, callback){

    db.newGraphReader()
    .get()
    .from('users', user)
    .related('todos')
    .then(function (response) {
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

module.exports.prototype.get = function(id, user, callback){

    this.checkOwnership(id, user, function(err, allowed){
        if(err) callback(err);
        else if(allowed){

            db.get('todos', id)
            .then(function(response){
                callback(null, {
                    title: response.body.title,
                    status: response.body.status,
                    id: id
                });
            })
            .fail(function(err){
                if(+err.statusCode === 404) callback(null, null);
                else callback(err);
            });

        } else {
            callback({
                statusCode: 403
            });
        }
    });

};

module.exports.prototype.create = function(model, user, callback){
    var id = this.createKey(),
        self = this;

    db.put('todos', id, model)
    .then(function(response){

        self.associate(id, user, function(err){
            if(err) callback(err);
            else callback(null, id);
        });

    })
    .fail(function(err){
        callback(err);
    });
};

module.exports.prototype.update = function(id, model, user, callback){

    this.checkOwnership(id, user, function(err, allowed){
        if(err) callback(err);
        else if(allowed){

            db.put('todos', id, model)
            .then(function(response){
                callback(null, id);
            })
            .fail(function(err){
                callback(err);
            });

        } else {
            callback({
                statusCode: 403
            });
        }
    });

};

module.exports.prototype.destroy = function(id, user, callback){

    this.checkOwnership(id, user, function(err, allowed){
        if(err) callback(err);
        else if(allowed){

            db.remove('todos', id)
            .then(function(response){
                callback(null, null);
            })
            .fail(function(err){
                callback(err);
            });

        } else {
            callback({
                statusCode: 403
            });
        }
    });

};

module.exports.prototype.associate = function(id, user, callback){

    // Associate user to todo
    db.newGraphBuilder()
    .create()
    .from('users', user)
    .related('todos')
    .to('todos', id)
    .then(function(response){

        // Associate todo to user
        db.newGraphBuilder()
        .create()
        .from('todos', id)
        .related('users')
        .to('users', user)
        .then(function(response){
            callback(null, null);
        })
        .fail(function(err){
            callback(err);
        });

    })
    .fail(function(err){
        callback(err);
    });

};

module.exports.prototype.checkOwnership = function(id, user, callback){
    db.newGraphReader()
    .get()
    .from('todos', id)
    .related('users')
    .then(function (response) {

        // Can the user see this
        callback(null, _(response.body.results).any({ path: { key: user }}));
    })
    .fail(function(err){
        callback(err);
    });
};

module.exports.prototype.createKey = function(){
    return uuid.v1();
};
