var pattern = /^[a-z0-9\_]+$/;

module.exports = function (key, value) {
    return pattern.test(value);
};
