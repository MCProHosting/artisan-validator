var _ = require('lodash');

function Language () {
    this.dictionary = {};
    this.globals = {};
}

/**
 * Loads a built-in language set.
 * @param  {String} name
 * @return {Language}
 */
Language.prototype.builtIn = function (name) {
    this.set(__dirname + '/lang/' + name + '.json');
    return this;
};

/**
 * Updates the language to use the given dictionary. If its an object, it
 * will be used raw. If it's a string, we'll load it as necessary.
 *
 * @param {String|Object} dictionary
 * @return {Language}
 */
Language.prototype.set = function (dictionary) {
    if (_.isString(dictionary)) {
        this.dictionary = require(dictionary);
    } else {
        this.dictionary = dictionary;
    }

    return this;
};

/**
 * Updates an existing language set with the given key/value(s): if the
 * first arguments is an object, it will be extended over the dictionary.
 *
 * @param  {String|Object} key
 * @param  {String} value
 * @return {Language}
 */
Language.prototype.extend = function (key, value) {
    if (typeof value === 'undefined') {
        _.extend(this.dictionary, key);
    } else {
        this.dictionary[key] = value;
    }

    return this;
};

/**
 * Renders a dictionary entry with the given data.
 *
 * @param  {String} key
 * @param  {Object} data
 * @return {String}
 */
Language.prototype.resolve = function (key, data) {
    var template = this.dictionary[key];
    if (typeof template === 'undefined') {
        template = this.dictionary.$missing;
    }

    return _.template(template, _.extend({}, this.globals, data));
};

/**
 * Adds the give kv pair into the "global" template variables.
 * @param  {String} key
 * @param  {*} value
 * @return {Language}
 */
Language.prototype.global = function (key, value) {
    this.globals[key] = value;
    return this;
};

module.exports = Language;
