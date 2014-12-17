module.exports = function (key, value, min, max) {
    return value.length > min && value.length < max;
};
