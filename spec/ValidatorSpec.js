var Validator = require('../lib/index');
var Bluebird = require('bluebird');

describe('the main validator', function () {
    var validator;
    beforeEach(function () {
        validator = new Validator();
    });

    it('should extract required', function () {
        var data = { a: 1, b: 2, c: null, d: undefined };
        var rules = { b: [['required']], c: [['required']], d: [] };
        var response = { addError: jasmine.createSpy('addError') };
        var out = validator.extractRequired(response, data, rules);

        expect(out).toEqual({ b: 2 });
        expect(response.addError).toHaveBeenCalledWith('c', 0);
    });

    it('should fulfill rules', function () {
        var rules = { a: ['foo: 1, 2, a: b, true'], b: ['required', ['foo', 1, '2']]};
        validator.fulfillRules(rules);
        expect(rules).toEqual({ a: [['foo', 1, 2, 'a: b', true]], b: [['required'], ['foo', 1, '2']]});
    });

    describe('try()', function () {

        it('should with success', function (done) {
            var data = { foo: 'bar' };
            var rules = { foo: ['rule: arg', 'noargs']};
            spyOn(validator.validators, 'run');
            validator.validators.run.and.returnValue(Bluebird.resolve(true));

            validator.try(data, rules).then(function (result) {
                expect(validator.validators.run).toHaveBeenCalledWith(data, 'foo', ['rule', 'arg']);
                expect(validator.validators.run).toHaveBeenCalledWith(data, 'foo', ['noargs']);
                expect(result.passed).toBe(true);
                expect(result.failed).toBe(false);
                expect(result.errors).toEqual({});
                done();
            });
        });

        it('should with failure', function (done) {
            var data = { foo: 'bar' };
            var rules = { foo: ['rule']};
            spyOn(validator.validators, 'run');
            spyOn(validator.language, 'resolve');
            validator.validators.run.and.returnValue(Bluebird.resolve(false));
            validator.language.resolve.and.returnValue('An error');

            validator.try(data, rules).then(function (result) {
                expect(validator.validators.run).toHaveBeenCalledWith(data, 'foo', ['rule']);
                expect(validator.language.resolve).toHaveBeenCalledWith('rule', {
                    key: 'foo',
                    value: 'bar',
                    args: []
                });

                expect(result.passed).toBe(false);
                expect(result.failed).toBe(true);
                expect(result.errors).toEqual({ foo: ['An error'] });
                done();
            });
        });

        it('should not for undefined values when not required', function (done) {
            var data = {};
            var rules = { foo: ['rule']};
            spyOn(validator.validators, 'run');

            validator.try(data, rules).then(function (result) {
                expect(validator.validators.run).not.toHaveBeenCalled();
                expect(result.passed).toBe(true);
                done();
            });
        });

        it('should not for null values when not required', function (done) {
            var data = { foo: null };
            var rules = { foo: ['rule']};
            spyOn(validator.validators, 'run');

            validator.try(data, rules).then(function (result) {
                expect(validator.validators.run).not.toHaveBeenCalled();
                expect(result.passed).toBe(true);
                done();
            });
        });

        it('should fail if not present value required', function (done) {
            var data = { foo: null };
            var rules = { foo: ['required', 'rule']};
            spyOn(validator.validators, 'run');

            validator.try(data, rules).then(function (result) {
                expect(validator.validators.run).not.toHaveBeenCalled();
                expect(result.passed).toBe(false);
                done();
            });
        });
    });
});
