var _ = require('lodash');

module.exports = function (key, value, expected) {
    if (!_.isBoolean(value)) {
        return false;
    }

    if (typeof expected !== 'undefined') {
        return value === expected;
    } else {
        return true;
    }
};
