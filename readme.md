# Artisan Validator

[![Build Status](https://travis-ci.org/MCProHosting/artisan-validator.svg)](https://travis-ci.org/MCProHosting/artisan-validator)
[![Code Climate](https://codeclimate.com/github/MCProHosting/artisan-validator/badges/gpa.svg)](https://codeclimate.com/github/MCProHosting/artisan-validator)

A module for simple and fun validation in Node.js.

### Quick Example

```js
var validator = require('artisan-validator')();
var rules {
    username: ['required', 'between: 4, 30', 'alphanumeric'],
    password: ['required', 'longer: 5'],
    acceptTOS: ['required', 'boolean: true']
};

validator.try(req.body, rules).then(function (result) {
    if (result.passed) {
        res.json(400, result.errors);
    } else {
        registerAccount();
    }
});
```

### Usage

#### Making the Validator

First we have to "check out" a validator instance to use later. That's easy enough:

```js
var validator = require('artisan-validator')();
```

#### Validating an Object

**All validations are asynchronous** and return promises. Although there are not any built-in asynchonous validations, you may very well want to add a custom rule that, for examples, checks to make sure a value does not already exist in the database.

We use the `try(obj, rules)` method, which returns a promise that is always resolved to a Results object.

```js
validator.try(req.body, {
    // Require the username, make sure it's between 4 and 30 alphanumeric characters.
    username: ['required', 'alphanumeric', 'between: 4, 30'],
    // Instead of 'between: 4, 30' we could alternately write ['between', 4, 30]
    password: ['required', 'not: contain: password']
}).then(function (result) {
    if (result.failed) {
        res.json(400, result.errors);
        // -> {"username": ["Username be alphanumeric."]}
    } else {
        res.json(200, "Your data is valid :)");
    }
});
```

##### Writing the Rules w/ Arguments

Rules are defined as an object with string keys that correspond to the expected input, as we saw above. The values should be an array of validators to run, like so:

```js
{
    // This will effectively run `required()`
    a: [ 'required' ],
    // This will run `between(4, 6)`
    b: [ 'between: 4, 6' ],
    // So will this (we don't care how you space)
    c: [ 'between:4,6' ],
    // And this will also run `between(4, 6)`
    d: [[ 'between', 4, 6 ]]
}
```

> Note: when working with the string-based shorthand, we try to types numbers correctly, but that's not very precise. If you need precise control your validator's input types, use the array notation.

##### Working with the Results object

The results object will always define the following properties:

 * `passed: Boolean` True if the validation rules passed, false otherwise.
 * `failed: Boolean` True if the validation rules failed, false otherwise.
 * `errors: Object` An object where keys are properties that had rules which failed (that is, values that are OK will not be included) and values are an array of strings of error messages, according to the Language.

Additionally, we pass through the following lodash methods on the results  that can be used to work with the errors object: `keys`, `values`, `pairs`, `invert`, `pick`, `omit`, `forIn`, `has`.

#### Adding Custom Validators

Custom validators may be defined on the validation instance. For example, if we wanted to make an incredibly useful validator to ensure a given input repeats "foo" a defined number of times, we might do the following:

```js
validator.validators.add(function isFoo (key, value, times) {
    return value === Array(times + 1).join('foo');
});
// Make sure fooBlerg is present and equal to "foofoofoo"
validator.try(req.body, { fooBlerg: ['required', 'isFoo: 3'] });
```

We pull the function name if you pass in a named function, but alternately you can define rules by passing in the name as the first argument: `validation.add('foo', function () { ... })`.

Your custom function always recieves at least two arguments, the key and value under validation, then is passed any arguments given in the ruleset. It is executed in the context of the input (`this` will be `req.body`, the case of the example) with the `$validator` property set to the validation instance. For example:

```js
validator.validators.add(function spy (key, value, name, target) {
    console.log(this);   // => { foo: 'bar' }
    console.log(key);    // => 'foo'
    console.log(value);  // => 'bar'
    console.log(name);   // => 'James Bond'
    console.log(target); // => 'Mr. Goldfinger'
    return true;
});
// Make sure fooBlerg is present and equal to "foofoofoo"
validator.try({ foo: 'bar' }, { foo: ['spy: James Bond, Mr. Goldfinger'] });
```

It should either return a boolean indicating a success status **or** return a promise that is resolved to a boolean true/false.

#### Built-in Rules

We build on the excellent foundation of [chriso/validator.js](https://github.com/chriso/validator.js) and define some of our own rules as well.

##### Types
 * `array()` - check if the value is an array.
 * `boolean([value])` - Whether the value is a boolean. If a value is passed, we check that the boolean equals that value.
 * `date()` - check if the value is a date.
 * `float()` - check if the value is a float.
 * `int()` - check if the value is an integer.
 * `numeric()` - check if the value contains only numbers.
 * `string()` - check that the value is a string.

##### Dates

 * `after([date])` - check if the value is a date that's after the specified date (defaults to now).
 * `before([date])` - check if the value is a date that's before the specified date.

##### Strings

 * `alpha()` - check if the value contains only letters (a-zA-Z).
 * `alphanumeric()` - check if the value contains only letters and numbers.
 * `ascii()` - check if the value contains ASCII chars only.
 * `base64()` - check if a string is base64 encoded.
 * `between(min, max)` - check if the value is a string with length within a range, exclusive. Note: this function takes into account surrogate pairs.
 * `byteLength(min [, max])` - check if the value's length (in bytes) falls in a range.
 * `contains(seed)` - check if the value contains the seed.
 * `creditCard()` - check if the value is a credit card.
 * `email()` - check if the value is an email.
 * `FQDN([options])` - check if the value is a fully qualified domain name (e.g. domain.com). options is an object which defaults to { require_tld: true, allow_underscores: false }.
 * `fullWidth()` - check if the value contains any full-width chars.
 * `halfWidth()` - check if the value contains any half-width chars.
 * `hexadecimal()` - check if the value is a hexadecimal number.
 * `hexColor()` - check if the value is a hexadecimal color.
 * `IP([version])` - check if the value is an IP (version 4 or 6).
 * `ISBN([version])` - check if the value is an ISBN (version 10 or 13).
 * `JSON()` - check if the value is valid JSON (note: uses JSON.parse).
 * `length(amt)` - check if the value's length equals an amount. Note: this function takes into account surrogate pairs.
 * `longer(min)` - check if the value's length is greater than an amount. Note: this function takes into account surrogate pairs.
 * `lowercase()` - check if the value is lowercase.
 * `matches(pattern)` - check if string matches the pattern.
 * `mongoId()` - check if the value is a valid hex-encoded representation of a MongoDB ObjectId.
 * `multibyte()` - check if the value contains one or more multibyte chars.
 * `shorter(max)` - check if the value's length is less than an amount. Note: this function takes into account surrogate pairs.
 * `surrogatePair()` - check if the value contains any surrogate pairs chars.
 * `uppercase()` - check if the value is uppercase.
 * `URL([options])` - check if the value is an URL. options is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false }`.
 * `UUID([version])` - check if the value is a UUID (version 3, 4 or 5).
 * `variableWidth()` - check if the value contains a mixture of full and half-width chars.

##### Numbers

 * `divisibleBy(number)` - check if the value is a number that's divisible by another.
 * `greaterThan(min)` - check if the value is a number and is greater than an amount
 * `lessThan(max)` - check if the value is a number and is less than an amount.
 * `within(min, max)` - check if the value is a number within a range, exclusive.

##### Generic

 * `equals(comparison)` - check if the value matches the comparison. is capable of doing a deep comparison between objects/arrays, via [assert.deepEquals](http://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message)
 * `in(values...)` - check if the value is in a array of allowed values. Warning: it's recommended to use array notation for this rule, unless all the values are strings and are not padded with spaces..
 * `not(str...)` - inverts the given rule. for example: `[ 'not', 'length', 5 ]` will pass whenever the length is *not* 5
 * **★** `required()` - check that the value is present (not null and not undefined). **if required is not passed, no validation rules will be run for values that aren't present**

#### Language

Error messages are generated from language files. Currently we only have a English set, `en`. (although you can contribute translations!) You can load an entirely new set:

```js
validator.language.set(__dirname + '/klingon.json');
// or, pass in directly
validator.language.set({ 'required': 'Y U NO GIVE US <%= key %>' });
```

Or you can extend and overwrite it -- especially helpful when making custom rules.

```js
// Update a single entry
validator.language.extend('isFoo', '<%= key %>, which was <%= value %>, did not include <%= args[0] %> foos!');
// Or multiple at once
validator.language.extend({
    'isFoo': '<%= key %>, which was <%= value %>, did not include <%= args[0] %> foos!',
    'isBar': 'Need moar bar.'
);
```

> Note: care should be taken to use the escaped value syntax (`<%= something %>`) to prevent potential XSS.

The markup for languages, as you can see, is fairly simple, using [Lodash's template functionality](https://lodash.com/docs#template). You can also define "global" variables to be made accessible in these templates:
```js
validator.language.global({ meaningOfLife: 42 });
```

#### Running Validators Manually

You can manually run validators on an object as well. They will (regardless of the underlying function) return a promise that is resolved to boolean true or false. Note that this accepts only the verbose array notation, not the string notation.

```js
validator.validators.run(
    { foo: 'foofoofoo' },
    'foo', ['isFoo', 3]
);
```
