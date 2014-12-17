var _ = require('lodash');

module.exports = function (key, value) {
    return _.isArray(value);
};
