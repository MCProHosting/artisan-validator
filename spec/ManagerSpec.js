var Bluebird = require('bluebird');
var Manager = require('../lib/manager');
var errors = require('../lib/errors');

describe('validations manager', function () {
    var manager;
    beforeEach(function () {
        manager = new Manager();
    });

    describe('adding', function () {
        it('named function', function () {
            var rule = function myRule () {};
            manager.add(rule);
            expect(manager.rules.myRule).toBe(rule);
        });

        it('fails when adding anon functions / native code', function () {
            // Fails because functon has no name
            expect(function () {
                manager.add(function () {});
            }).toThrow(new errors.RuleError());

            // Failes because .bind creates an anon native code fn
            expect(function () {
                manager.add((function rule () {}).bind(null));
            }).toThrow(new errors.RuleError());
        });

        it('an explicitly named function', function () {
            var rule = function () {};
            manager.add('myRule', rule);
            expect(manager.rules.myRule).toBe(rule);
        });

        it('loads a directory', function () {
            manager.loadDir(__dirname + '/fixture/rules');
            expect(manager.rules.a()).toBe('a');
            expect(manager.rules.b()).toBe('b');
            expect(manager.rules.c()).toBe('c');
        });
    });

    describe('runs', function () {
        it('should reject unknown rules', function (done) {
            var errored = false;
            manager.run({}, '', ['someSillyRule'])
                .catch(errors.RuleError, function () {
                    errored = true;
                })
                .finally(function () {
                    expect(errored).toBe(true);
                    done();
                });
        });

        it('should pass values into validator', function (done) {
            var obj = { foo: 'bar' };
            var called = false;
            manager.add(function funValidator (key, value, arg1, arg2) {
                expect(key).toBe('foo');
                expect(value).toBe('bar');
                expect(arg1).toBe('grr');
                expect(arg2).toBe('blerg');
                expect(this).toBe(obj);
                called = true;
                return true;
            });
            manager.run(obj, 'foo', ['funValidator', 'grr', 'blerg'])
                .then(function () {
                    expect(called).toBe(true);
                    done();
                });
        });

        it('should handle synchronous validators', function (done) {
            var obj = { foo: 'bar' };
            var called = false;
            manager.add(function funValidator (key, value, arg) {
                called = true;
                return true;
            });
            manager.run(obj, 'foo', ['funValidator'])
                .then(function (result) {
                    expect(result).toBe(true);
                    expect(called).toBe(true);
                    done();
                });
        });

        it('should handle asynchronous validators', function (done) {
            var obj = { foo: 'bar' };
            var called = false;
            manager.add(function funValidator (key, value, arg) {
                called = true;
                return Bluebird.resolve(true);
            });
            manager.run(obj, 'foo', ['funValidator'])
                .then(function (result) {
                    expect(result).toBe(true);
                    expect(called).toBe(true);
                    done();
                });
        });
    });
});
