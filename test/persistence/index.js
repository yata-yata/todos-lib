// Load modules

var Lab = require('lab'),
    TodosPersist = require('../../lib/persistence/todos'),

    // Declare internals
    internals = {},

    // Test aliases
    expect = Lab.expect,
    before = Lab.before,
    beforeEach = Lab.beforeEach,
    after = Lab.after,
    afterEach = Lab.afterEach,
    describe = Lab.experiment,
    it = Lab.test,
    assert = Lab.assert;

describe('persistence todos', function () {
    describe('#createKey', function(){
        it('returns a random id', function(done){
            var todo = new TodosPersist();

            expect(todo.createKey()).to.not.equal(todo.createKey());

            done();
        });
    });
});

