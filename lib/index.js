var Bluebird = require('bluebird');
var _ = require('lodash');

var Response = require('./response');
var Manager = require('./manager');
var Language = require('./language');

// Symbol between the rule name and its parameters in string-type rules.
var methodDelimiter = ':';
// Symbol between arguments in rules.
var argumentDelimiter = ',';

function Validator () {
    this.validators = new Manager();
    this.language = new Language();
    this.language.set(require('./lang/en'));
}

/**
 * Checks to ensure all data required by the ruleset is present, and trims
 * the rules to remove rules that apply to data which is not present.
 * @param {Response} response
 * @param {Object} data
 * @param {Object} rules
 * @return {Object}
 */
Validator.prototype.extractRequired = function (response, data, rules) {
    var output = {};

    for (var key in rules) {
        // Loosely equal to null to check for undefined/null. Do nothing
        // if the key exists in the dataset.
        if (data[key] != null) {
            output[key] = data[key];
            continue;
        }

        // If the data has a "required", rule, add an error.
        for (var i = 0, l = rules[key].length; i < l; i++) {
            if (rules[key][i][0] === 'required') {
                response.addError(key, i);
                break;
            }
        }
    }

    // Now remove all "required"s as they aren't actually validators.
    for (var key in rules) {
        rules[key] = _.reject(rules[key], function (rule) {
            return rule[0] === 'required';
        });
    }

    return output;
};

/**
 * Formats rules from the option string-based format, to arrays. Attempts
 * to case data types when appropriate.
 */
Validator.prototype.fulfillRules = function (rules) {
    for (var key in rules) {
        rules[key] = rules[key].map(fulfillRule);
    }
};

/**
 * Attempts to run a validation.
 *
 * @param  {Object} data
 * @param  {Object} rules
 * @return {Promise}
 */
Validator.prototype.try = function (data, rules) {
    var response = new Response(this.language, data, rules);
    this.fulfillRules(rules);
    data = this.extractRequired(response, data, rules);

    var todo = [], promise;
    // Add promise to the todo for every validator in every rule.
    for (var key in data) {
        var item = data[key];
        for (var i = 0, l = rules[key].length; i < l; i++) {
            promise = this.validators
                .run(data, key, rules[key][i])
                .then(addError.bind(this, response, key, i));

            todo.push(promise);
        }
    }

    // Run all the todos through and pass back the response object
    return Bluebird.all(todo)
        .then(function () {
            return response;
        });
};

/**
 * Parses string-type rule inputs into usable arrays.
 * @param  {Array|String} rule
 * @return {Array}
 */
function fulfillRule (rule) {
    // If it's already an array, do nothing.
    if (_.isArray(rule)) {
        return rule;
    }

    var division = rule.indexOf(methodDelimiter);
    // If the rule has not parameters, simply output it.
    if (division === -1) {
        return [rule.trim()];
    }

    var output = [ rule.slice(0, division).trim() ];
    // Loop over all the arguments
    var args = rule.slice(division + 1).split(argumentDelimiter);
    for (var i = 0, l = args.length; i < l; i++) {
        var arg = args[i].trim();

        // JSON parse will fix types for booleans, numbers, and
        // arrays/objects
        try {
            arg = JSON.parse(arg);
        } catch (e) {}

        output.push(arg);
    }

    return output;
}

/**
 * Handler function. Expected to be partially bound and have the "result"
 * fulfilled, to prevent the need to define functions within a loop.
 *
 * @param {Response} response
 * @param {String} key
 * @param {Number} ruleIndex
 * @param {Boolean} result
 */
function addError (response, key, ruleIndex, result) {
    if (!result) {
        response.addError(key, ruleIndex);
    }
}

module.exports = Validator;
