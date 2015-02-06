var _ = require('lodash');

function RuleError () {
	Error.apply(this, arguments);
}
RuleError.prototype = Object.create(Error.prototype);

function ValidationError (response) {
	this.name = 'ValidationError';

	_.merge(this, response);
}
ValidationError.prototype = Object.create(Error.prototype);

module.exports.RuleError = RuleError;
module.exports.ValidationError = ValidationError;
