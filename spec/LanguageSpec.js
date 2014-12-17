var Language = require('../lib/language');

describe('language', function () {
    var language;
    beforeEach(function () {
        language = new Language();
    });

    it('sets the dictionary from object', function () {
        expect(language.dictionary).toEqual({});
        language.set({ 'foo': 'bar' });
        expect(language.dictionary).toEqual({ foo: 'bar' });
    });

    it('sets the dictionary from json', function () {
        expect(language.dictionary).toEqual({});
        language.set(__dirname + '/fixture/dict.json');
        expect(language.dictionary).toEqual({ foo: 'bar' });
    });

    it('extends the dictionary', function () {
        expect(language.dictionary).toEqual({});
        language.extend('bar', 'baz');
        language.extend({ fizz: 'buzz' });
        expect(language.dictionary).toEqual({ bar: 'baz', fizz: 'buzz' });
    });

    it('resolves dictionary items', function () {
        language.set({ 'greet': 'Hello <%= who %>' });
        expect(language.resolve('greet', { who: 'World' })).toBe('Hello World');
    });
});
