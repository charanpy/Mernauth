const { check } = require("express-validator");

//^Register
exports.validRegister = [
            check('name', 'Name is required').not().isEmpty()
                        .isLength({
                                    min: 4,
                                    max: 32
                        }).withMessage("Name should be of length between 4 to 32"),
            check("email").not().isEmpty().withMessage("Must be a valid email "),
            check("password", "password is required").notEmpty(),
            check('password').isLength({
                        min: 6
            }).withMessage("Password should be length of atleast 6 characters")
]

//^Login
exports.validLogin = [
            check("email")
                        .isEmail()
                        .withMessage("Must be valid email address"),
            check("password", "password is required").notEmpty(),
            check('password').isLength({
                        min: 6
            }).withMessage("Password should be length of atleast 6 characters")
]


//!Forgot Password
exports.forgetPasswordValidator = [
            check("email", "Must be a valid email address")
                        .not()
                        .isEmpty()
                        .isEmail()
]

//!Reset password
exports.resetPasswordValidator = [
            check('newPassword')
                        .not()
                        .isEmpty()
                        .isLength({
                                    min: 6
                        }).withMessage("Password should be length of atleast 6 characters")
]