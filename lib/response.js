var _ = require('lodash');

/**
 * Used to pass back to the consumer. Contains validation errors and success
 * status.
 *
 * @param {Object} language
 * @param {Object} data
 * @param {String} rules
 */
function Response (language, data, rules) {
    this.language = language;
    this.data = data;
    this.rules = rules;

    this.errors = {};
    this.hasErrors = false;

    var self = this;
    // Define the "passed" property
    Object.defineProperty(this, 'passed', {
        enumerable: true,
        get: function () {
            return !self.hasErrors;
        }
    });
    // Define the "failed" property
    Object.defineProperty(this, 'failed', {
        enumerable: true,
        get: function () {
            return self.hasErrors;
        }
    });
}

/**
 * Adds a new error to the response, and sets the status to having failed.
 * @param {String} key       [description]
 * @param {Number} ruleIndex [description]
 */
Response.prototype.addError = function (key, ruleIndex) {
    if (typeof this.errors[key] === 'undefined') {
        this.errors[key] = [];
    }

    var ruleSet = this.rules[key][ruleIndex];
    var message = this.language.resolve(ruleSet[0], {
        key: key,
        value: this.data[key],
        args: ruleSet.slice(1)
    });

    this.errors[key].push(message);
    this.hasErrors = true;
};


// Bind lodash methods to the response, passing them through to the
// errors object.
var methods = [ 'keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'forIn', 'has' ];
methods.forEach(function (method) {
    Response.prototype[method] = function () {
        var args = [ this.errors ].concat(arguments);
        return _[method].apply(_, args);
    };
});

module.exports = Response;
