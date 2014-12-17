var Bluebird = require('bluebird');
var Manager = require('../lib/manager');
var errors = require('../lib/errors');

describe('validations', function () {
    var manager;
    beforeEach(function () {
        manager = new Manager();
    });

    describe('chriso\'s validator', function (done) {
        // Not going to test every single function. If specific issues arise
        // we'll test individual affected functions, but really I just want
        // to make sure that binding workds.
        it('basically works: no args, passing', function (done) {
            manager.run({ 'foo': 'asdf' }, 'foo', ['alpha'])
                .then(function (result) {
                    expect(result).toBe(true);
                    done();
                });
        });
        it('basically works: no args, failing', function (done) {
            manager.run({ 'foo': 'asd123f' }, 'foo', ['alpha'])
                .then(function (result) {
                    expect(result).toBe(false);
                    done();
                });
        });
        it('basically works: args, passing', function (done) {
            manager.run({ 'foo': '127.0.0.1' }, 'foo', ['IP', 4])
                .then(function (result) {
                    expect(result).toBe(true);
                    done();
                });
        });
        it('basically works: args, failing', function (done) {
            manager.run({ 'foo': '127.0.0.1' }, 'foo', ['IP', 6])
                .then(function (result) {
                    expect(result).toBe(false);
                    done();
                });
        });
    });
});
