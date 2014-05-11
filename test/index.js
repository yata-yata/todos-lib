// Load modules

var Lab = require('lab'),
    Todos = require('../'),
    TodosPersist = require('../lib/persistence/todos'),
    Nock = require('nock'),

    // Declare internals
    internals = {},

    // Configs
    orchestrateUrl = 'https://api.orchestrate.io:443',
    baseUri = '/v0/todos',

    // Test aliases
    expect = Lab.expect,
    before = Lab.before,
    beforeEach = Lab.beforeEach,
    after = Lab.after,
    afterEach = Lab.afterEach,
    describe = Lab.experiment,
    it = Lab.test,
    assert = Lab.assert;

describe('todos-lib', function () {
    var createKey;
    before(function(done){
        createKey = TodosPersist.prototype.createKey;

        TodosPersist.prototype.createKey = function(){
            return '123';
        };

        done();
    });

    after(function(done){
        TodosPersist.prototype.createKey = createKey;

        done();
    });

    describe('get', function(){
        it('returns an object with a title, status and id if passed a single id', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
            .get(baseUri + '/123')
            .replyWithFile(200, __dirname + '/fixtures/todo.json');

            todo.get({ id: '123', user: '123' }, function(err, todo){
                expect(todo).to.have.property('title');
                expect(todo).to.have.property('status');
                expect(todo).to.have.property('id');
                done();
            });
        });

        it('returns an error object with a status code of 403 if passed a single id and a user not associated', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            todo.get({ id: '123', user: '456' }, function(err, todo){
                expect(err).to.exist;
                expect(err.statusCode).to.equal(403);
                done();
            });
        });

        it('returns an error if retrieving owners fails', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .reply(500);

            todo.get({ id: '123', user: '456' }, function(err, todo){
                expect(err).to.exist;
                done();
            });
        });

        it('returns null if passed a single id that doesn\'t exist', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
                .get(baseUri + '/123')
                .reply(404);

            todo.get({ id: '123', user: '123' }, function(err, todo){
                expect(todo).to.be.a('null');
                done();
            });
        });

        it('returns error if an error occurs', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
                .get(baseUri + '/123')
                .reply(500, new Error());

            todo.get({ id: '123', user: '123' }, function(err, todo){
                expect(err).to.exist;
                done();
            });
        });

        it('returns an array where all objects have a title, status and id if no id is passed', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get('/v0/users/123/relations/todos')
            .replyWithFile(200, __dirname + '/fixtures/list.json');

            todo.get({ user: '123' }, function(err, todos){

                expect(todos).to.be.instanceof(Array);

                todos.forEach(function(todo){
                    expect(todo).to.have.property('title');
                    expect(todo).to.have.property('status');
                    expect(todo).to.have.property('id');
                });

                done();
            });
        });

        it('returns error if an error occurs', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get('/v0/users/123/relations/todos')
            .replyWithFile(200, __dirname + '/fixtures/list.json');

            Nock(orchestrateUrl)
                .get(baseUri)
                .reply(500, new Error());

            todo.get({ user: '123' }, function(err, todo){
                expect(err).to.exist;
                done();
            });
        });


    });

    describe('create', function(){

        it('returns error if an error occurs', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(500);

            todo.create({ model: { title: 'test' }, user: '123'}, function(err, id){
                expect(err).to.exist;
                done();
            });
        });

        it('returns the id of the new object', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(200);

            Nock(orchestrateUrl)
            .put('/v0/users/123/relation/todos/todos/123')
            .reply(200);

            Nock(orchestrateUrl)
            .put('/v0/todos/123/relation/users/users/123')
            .reply(200);

            todo.create({ model: { title: 'test' }, user: '123' }, function(err, id){
                expect(id).to.equal('123');
                done();
            });
        });


        it('returns an error if the association between todo and user fails', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(200);

            Nock(orchestrateUrl)
            .put('/v0/users/123/relation/todos/todos/123')
            .reply(500);

            Nock(orchestrateUrl)
            .put('/v0/todos/123/relation/users/users/123')
            .reply(200);

            todo.create({ model: { title: 'test' }, user: '123' }, function(err, id){
                expect(err).to.exist;
                done();
            });
        });

        it('returns an error if the association between todo and user fails', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(200);

            Nock(orchestrateUrl)
            .put('/v0/users/123/relation/todos/todos/123')
            .reply(200);

            Nock(orchestrateUrl)
            .put('/v0/todos/123/relation/users/users/123')
            .reply(500);

            todo.create({ model: { title: 'test' }, user: '123' }, function(err, id){
                expect(err).to.exist;
                done();
            });
        });


    });

    describe('update', function(){

        it('returns error if an error occurs', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(500);

            todo.update({ id: '123', user: '123', model: { title: 'test' } }, function(err, id){
                expect(err).to.exist;
                done();
            });
        });

        it('returns the id of the new object', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
            .put(baseUri + '/123')
            .reply(200, {});

            todo.update({ id: '123', user: '123', model: { title: 'test' } }, function(err, id){
                expect(id).to.equal('123');
                done();
            });
        });

        it('returns an error object with a status code of 403 if the user not associated', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            todo.update({ id: '123', user: '456', model: { title: 'test' } }, function(err, todo){
                expect(err).to.exist;
                expect(err.statusCode).to.equal(403);
                done();
            });
        });

        it('returns an error if retrieving owners fails', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .reply(500);

            todo.update({ id: '123', user: '123', model: { title: 'test' } }, function(err, todo){
                expect(err).to.exist;
                done();
            });
        });

    });

    describe('destroy', function(){

        it('returns error if an error occurs', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
                .delete(baseUri + '/123')
                .reply(500);

            todo.destroy({ id: '123', user: '123' }, function(err, response){
                expect(err).to.exist;
                done();
            });
        });

        it('returns the id of the new object', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            Nock(orchestrateUrl)
                .delete(baseUri + '/123')
                .reply(200, {});

            todo.destroy({ id: '123', user: '123' }, function(err, response){
                expect(response).to.be.a('null');
                done();
            });
        });

        it('returns an error object with a status code of 403 if the user not associated', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .replyWithFile(200, __dirname + '/fixtures/todosGraph.json');

            todo.destroy({ id: '123', user: '456' }, function(err, todo){
                expect(err).to.exist;
                expect(err.statusCode).to.equal(403);
                done();
            });
        });

        it('returns an error if retrieving owners fails', function(done){
            var todo = new Todos();

            Nock(orchestrateUrl)
            .get(baseUri + '/123/relations/users')
            .reply(500);

            todo.destroy({ id: '123', user: '123' }, function(err, todo){
                expect(err).to.exist;
                done();
            });
        });

    });
});
