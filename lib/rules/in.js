module.exports = function (key, value) {
    var expected = [].slice.call(arguments, 2);
    return expected.indexOf(value) !== -1;
};
