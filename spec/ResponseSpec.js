var Response = require('../lib/response');

describe('response', function () {
    var response, resolve;
    beforeEach(function () {
        resolve = jasmine.createSpy('language resolve');
        response = new Response({ resolve: resolve }, { 'foo': 'bar' }, { 'foo': [['rule', 1, 2]] });
    });

    it('exposes base data', function () {
        expect(response.passed).toBe(true);
        expect(response.failed).toBe(false);
        expect(response.errors).toEqual({});
    });

    it('behaves after error has been added and displays message', function () {
        resolve.and.returnValue('message');
        response.addError('foo', 0);
        expect(response.errors).toEqual({ 'foo': ['message']});
        expect(response.failed).toBe(true);
        expect(response.passed).toBe(false);
        expect(resolve).toHaveBeenCalledWith('rule', {
            key: 'foo',
            value: 'bar',
            args: [1, 2]
        });

        response.addError('foo', 0);
        expect(response.errors).toEqual({ 'foo': ['message', 'message']});
    });

    it('should pass through lodash', function () {
        response.addError('foo', 0);
        expect(response.keys()).toEqual(['foo']);
    });
});
