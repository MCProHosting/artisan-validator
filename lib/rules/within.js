var _ = require('lodash');

module.exports = function (key, value, min, max) {
    return _.isNumber(value) && value >= min && value <= max;
};
