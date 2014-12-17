var assert = require('assert');

module.exports = function (key, value, expected) {
    try {
        assert.deepEqual(value, expected);
        return true;
    } catch (e) {
        if (e instanceof assert.AssertionError) {
            return false;
        } else {
            throw e;
        }
    }
};
