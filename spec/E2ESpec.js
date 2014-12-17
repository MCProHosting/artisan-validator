
// Some end-to-end tests just to make sure it all fits together :)
describe('everythang', function () {
    var validator, rules;
    beforeEach(function () {

        validator = require('../index')();
        rules = {
            username: ['required', 'between: 4, 30', 'alphanumeric'],
            password: ['required', 'longer: 5'],
            acceptTOS: ['required', 'boolean: true']
        };
    });

    it('passses', function (done) {
        validator.try({
            username: 'connor4312',
            password: 'secret',
            acceptTOS: true
        }, rules).then(function (result) {
            expect(result.passed).toBe(true);
            expect(result.failed).toBe(false);
            expect(result.errors).toEqual({});
            done();
        });
    });

    it('fails', function (done) {
        validator.try({
            username: 'connor4312',
            acceptTOS: false
        }, rules).then(function (result) {
            expect(result.passed).toBe(false);
            expect(result.failed).toBe(true);
            expect(result.errors).toEqual({
                password: [ 'The password is required.' ],
                acceptTOS: [ 'The acceptTOS must be a boolean.' ]
            });

            done();
        });
    });
});
