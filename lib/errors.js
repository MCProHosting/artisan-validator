module.exports.RuleError = function () {
    Error.apply(this, arguments);
};
module.exports.RuleError.prototype = Object.create(Error.prototype);
