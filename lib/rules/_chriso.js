var validator = require('validator');

// Mapping of chriso/validation names => artisan-validator names.
var mapping = {
    contains: 'contains',
    matches: 'matches',
    isEmail: 'email',
    isURL: 'URL',
    isFQDN: 'FQDN',
    isIP: 'IP',
    isAlpha: 'alpha',
    isNumeric: 'numeric',
    isAlphanumeric: 'alphanumeric',
    isBase64: 'base64',
    isHexadecimal: 'hexadecimal',
    isHexColor: 'hexColor',
    isLowercase: 'lowercase',
    isUppercase: 'uppercase',
    isInt: 'int',
    isFloat: 'float',
    isDivisibleBy: 'divisibleBy',
    isNull: 'null',
    isLength: 'length',
    isByteLength: 'byteLength',
    isUUID: 'uUID',
    isDate: 'date',
    isAfter: 'after',
    isBefore: 'before',
    isIn: 'in',
    isCreditCard: 'creditCard',
    isISBN: 'ISBN',
    isJSON: 'JSON',
    isAscii: 'ascii',
    isVariableWidth: 'variableWidth',
    isMongoId: 'mongoId'
};

module.exports = {};
for (var key in mapping) {
    module.exports[mapping[key]] = (function (fn) {
        return validator[fn].apply(validator, [].slice.call(arguments, 2));
    }).bind(null, key);
}
