var _ = require('lodash');

module.exports = function (key, value, min) {
    return _.isString(value) && value.length > min;
};
