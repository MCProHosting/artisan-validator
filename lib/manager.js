var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Bluebird = require('bluebird');

var RuleError = require('./errors').RuleError;

function Manager () {
    this.rules = {};
    this.loadDir(__dirname + '/rules');
}

/**
 * Loads a directory full of rule defintions. It's expected that every file
 * exports a function which is a valid rule, and that the file name is the
 * rule name. Alternately it may export an object which will be extended
 * atop the existing rules.
 *
 * @param  {String} path
 * @return {Manager}
 */
Manager.prototype.loadDir = function (loadPath) {
    // Get all the files in that directory.
    var files = fs.readdirSync(loadPath);

    for (var i = 0, l = files.length; i < l; i++) {
        var file = files[i];
        // Ignore non-.js files
        if (path.extname(file) !== '.js') {
            continue;
        }

        // Pull out the file base name and the path to require.
        var module = require(path.join(loadPath, file));
        if (typeof module === 'function') {
            this.rules[path.basename(file, '.js')] = module;
        } else {
            _.extend(this.rules, module);
        }
    }

    return this;
};

/**
 * Runs a validation for a rule.
 *
 * @param  {Object} data
 * @param  {String} key
 * @param  {Array} params
 * @return {Promise}
 */
Manager.prototype.run = function (data, key, params) {
    var rule = this.rules[params[0]];
    var args = [key, data[key]].concat(params.slice(1));

    // Rule lookup failed, resolve to an error.
    if (typeof rule === 'undefined') {
        return Bluebird.reject(new RuleError(params[0] + ' is not defined.'));
    }

    var output = rule.apply(data, args);
    if (typeof output.then === 'function') {
        // If it returned a promise, just give it back.
        return output;
    } else {
        // Otherwise resolve it explicitly
        return Bluebird.resolve(output);
    }
};

/**
 * Adds a new rule to the manager. Takes a named function as its only
 * only parameter, or takes an explcit name as its first param and
 * any function as its second.
 *
 * @param {String|Function} name
 * @param {Function} fn
 * @return {Manager}
 */
Manager.prototype.add = function (name, fn) {
    if (typeof fn === 'undefined') {
        // Try to match the function name, casting it to a string.
        var parts = ('' + name).match(/^function (.*?) ?\(/i);
        // If we didn't get a match...
        if (parts === null) {
            throw new RuleError('Unable to recognize name in rule definition');
        }
        // If we got an anonymous function.
        if (parts[1] === '') {
            throw new RuleError('Cannot define rule based on anonymous function. ' +
                                'Please pass a name explicitly');
        }

        fn = name;
        name = parts[1];
    }

    this.rules[name] = fn;
    return this;
};

module.exports = Manager;
