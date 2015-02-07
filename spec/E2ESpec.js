
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

    describe('tryOrFail', function () {
        it('passes', function (done) {
            validator.tryOrFail({
                username: 'brendanashworth',
                password: 'secret',
                acceptTOS: true
            }, rules).then(function(result) {
                expect(result.name).toBe(undefined);

                expect(result.passed).toBe(true);
                expect(result.failed).toBe(false);
                expect(result.errors).toEqual({});

                done();
            }).catch(function(err) {
                this.fail();

                done();
            });
        });

        it('fails', function (done) {
            validator.tryOrFail({
                username: 'brendanashworth',
                acceptTOS: false
            }, rules).then(function(result) {
                this.fail();

                done();
            }).catch(function(err) {
                expect(err.name).toEqual('ValidationError');

                expect(err.passed).toBe(false);
                expect(err.failed).toBe(true);
                expect(err.errors).toEqual({
                    password: [ 'The password is required.' ],
                    acceptTOS: [ 'The acceptTOS must be a boolean.' ]
                });

                done();
            });
        })
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
