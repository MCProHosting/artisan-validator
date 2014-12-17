var _ = require('lodash');

module.exports = function (key, value, max) {
    return _.isNumber(value) && value < max;
};
