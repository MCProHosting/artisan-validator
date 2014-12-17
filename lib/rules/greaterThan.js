var _ = require('lodash');

module.exports = function (key, value, min) {
    return _.isNumber(value) && value > min;
};
