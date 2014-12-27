var Bluebird = require('bluebird');
var Manager = require('../lib/manager');
var errors = require('../lib/errors');

describe('validations', function () {
    var manager;
    beforeEach(function () {
        manager = new Manager();
    });

    describe('chriso\'s validator', function () {
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

    describe('between', function () {
        var fn = require('../lib/rules/between');

        it('rejects lower/upper bound', function () {
            expect(fn(null, 'abc', 3, 6)).toBe(false);
            expect(fn(null, 'abcefg', 3, 6)).toBe(false);
        });
        it('accepts within range', function () {
            expect(fn(null, 'abcd', 3, 6)).toBe(true);
        });
    });

    describe('boolean', function () {
        var fn = require('../lib/rules/boolean');

        it('checks the type', function () {
            expect(fn(null, 'hi')).toBe(false);
            expect(fn(null, 0)).toBe(false);
            expect(fn(null, true)).toBe(true);
            expect(fn(null, false)).toBe(true);
        });
        it('expects correctly', function () {
            expect(fn(null, true, true)).toBe(true);
            expect(fn(null, true, false)).toBe(false);
            expect(fn(null, false, true)).toBe(false);
            expect(fn(null, false, false)).toBe(true);
        });
    });

    describe('array', function () {
        var fn = require('../lib/rules/array');

        it('checks the type', function () {
            expect(fn(null, 'hi')).toBe(false);
            expect(fn(null, 0)).toBe(false);
            expect(fn(null, [])).toBe(true);
            expect(fn(null, [42])).toBe(true);
        });
    });

    describe('shorter', function () {
        var fn = require('../lib/rules/shorter');

        it('checks', function () {
            expect(fn(null, 'hi', 3)).toBe(true);
            expect(fn(null, 'hello', 3)).toBe(false);
            expect(fn(null, [], 0)).toBe(false);
            expect(fn(null, {}, 0)).toBe(false);
        });
    });

    describe('longer', function () {
        var fn = require('../lib/rules/longer');

        it('checks', function () {
            expect(fn(null, 'hi', 3)).toBe(false);
            expect(fn(null, 'hello', 3)).toBe(true);
            expect(fn(null, [], 0)).toBe(false);
            expect(fn(null, {}, 0)).toBe(false);
        });
    });

    describe('greaterThan', function () {
        var fn = require('../lib/rules/greaterThan');

        it('checks', function () {
            expect(fn(null, 'hi', 3)).toBe(false);
            expect(fn(null, {}, 3)).toBe(false);
            expect(fn(null, 3, 3)).toBe(false);
            expect(fn(null, 4, 3)).toBe(true);
            expect(fn(null, 40, 4)).toBe(true);
        });
    });

    describe('lessThan', function () {
        var fn = require('../lib/rules/lessThan');

        it('checks', function () {
            expect(fn(null, 'hi', 3)).toBe(false);
            expect(fn(null, {}, 3)).toBe(false);
            expect(fn(null, 3, 3)).toBe(false);
            expect(fn(null, 1, 3)).toBe(true);
            expect(fn(null, -40, 4)).toBe(true);
        });
    });

    describe('within', function () {
        var fn = require('../lib/rules/within');

        it('checks', function () {
            expect(fn(null, 'hi', 3, 6)).toBe(false);
            expect(fn(null, {}, 3, 6)).toBe(false);
            expect(fn(null, 2, 3, 6)).toBe(false);
            expect(fn(null, 5, 3, 6)).toBe(true);
            expect(fn(null, 9, 4)).toBe(false);
        });
    });

    describe('equal', function () {
        var fn = require('../lib/rules/equal');

        it('checks strings', function () {
            expect(fn(null, 'hi', 'hi')).toBe(true);
            expect(fn(null, 'hi', 'hiii')).toBe(false);
        });

        it('checks numbers', function () {
            expect(fn(null, 3, 3)).toBe(true);
            expect(fn(null, 3, '3')).toBe(true);
            expect(fn(null, 3, 6)).toBe(false);
        });

        it('checks arrays', function () {
            expect(fn(null, [], [42, ['a']])).toBe(false);
            expect(fn(null, [42, ['b']], [42, ['a']])).toBe(false);
            expect(fn(null, [42, ['a']], [42, ['a']])).toBe(true);
            expect(fn(null, [42, ['a']], [])).toBe(false);

        });

        it('checks objects', function () {
            expect(fn(null, {}, { a: 42, b: ['a']})).toBe(false);
            expect(fn(null, { a: 42, b: ['b']}, { a: 42, b: ['a']})).toBe(false);
            expect(fn(null, { a: 42, b: ['a']}, { a: 42, b: ['a']})).toBe(true);
            expect(fn(null, { a: 42, b: ['a']}, {})).toBe(false);
        });
    });

    describe('in', function () {
        var fn = require('../lib/rules/in');

        it('checks', function () {
            expect(fn(null, 'a', 'b', 'c', 'd')).toBe(false);
            expect(fn(null, 'b', 'b', 'c', 'd')).toBe(true);
        });
    });

    describe('string', function () {
        var fn = require('../lib/rules/string');

        it('checks', function () {
            expect(fn(null, 'a')).toBe(true);
            expect(fn(null, 0)).toBe(false);
            expect(fn(null, [])).toBe(false);
        });
    });

    describe('cases', function () {
        var snake = require('../lib/rules/snakeCase');
        var studly = require('../lib/rules/studlyCase');
        var camel = require('../lib/rules/camelCase');

        it('snakes', function () {
            expect(snake(null, 'hello')).toBe(true);
            expect(snake(null, 'hello_world')).toBe(true);
            expect(snake(null, 'hello_world!')).toBe(false);
            expect(snake(null, 'helloWorld')).toBe(false);
            expect(snake(null, 'helloWorld!')).toBe(false);
            expect(snake(null, 'HelloWorld')).toBe(false);
            expect(snake(null, 'HelloWorld!')).toBe(false);
        });

        it('studlys', function () {
            expect(studly(null, 'hello')).toBe(false);
            expect(studly(null, 'hello_world')).toBe(false);
            expect(studly(null, 'hello_world!')).toBe(false);
            expect(studly(null, 'helloWorld')).toBe(false);
            expect(studly(null, 'helloWorld!')).toBe(false);
            expect(studly(null, 'HelloWorld')).toBe(true);
            expect(studly(null, 'HelloWorld!')).toBe(false);
        });

        it('camels', function () {
            expect(camel(null, 'hello')).toBe(true);
            expect(camel(null, 'hello_world')).toBe(false);
            expect(camel(null, 'hello_world!')).toBe(false);
            expect(camel(null, 'helloWorld')).toBe(true);
            expect(camel(null, 'helloWorld!')).toBe(false);
            expect(camel(null, 'HelloWorld')).toBe(false);
            expect(camel(null, 'HelloWorld!')).toBe(false);
        });
    });
});
