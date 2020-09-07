const User = require('../models/Auth');
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helper/dbErrorHandler");
const sendMail = require("@sendgrid/mail")
sendMail.setApiKey(process.env.MAIL_KEY)
// ^Register

exports.registerController = (req, res) => {
            const { name, email, password } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                        const firstError = errors.array().map(err => err.msg)[0];
                        return res.status(422).json({
                                    error: firstError
                        })
            } else {
                        User.findOne({
                                    email
                        }).exec((err, user) => {
                                    if (user) {
                                                return res.status(400).json({
                                                            error: 'Email already exists'
                                                })
                                    }
                        })
                        //^generate Token
                        const token = jwt.sign({
                                    name,
                                    email,
                                    password
                        },
                                    process.env.JWT_ACCOUNT_ACTIVATE, {
                                    expiresIn: '15m'
                        })

                        //^Email activation
                        const emailData = {
                                    from: process.env.EMAIL_FROM,
                                    to: email,
                                    subject: `Account activation link`,
                                    html: `
                        <h1>Please click to activate your account</h1>
                        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                        <hr/>
                        <p>This email contains sensitive info</p>
                        <p>${process.env.CLIENT_URL}</p>
                        `

                        }
                        sendMail.send(emailData).then(sent => {
                                    return res.json({
                                                message: `Emailhas been sent to ${email}`
                                    })
                        }).catch(e => {
                                    console.log(e, e[0]);
                                    return res.status(400).json({
                                                error: errorHandler(e)
                                    })
                        })

            }
}

//^Register User by activating email
exports.activationController = (req, res) => {
            const { token } = req.body;

            if (token) {
                        //^verify token is valid or expired
                        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATE, (err, decoded) => {
                                    if (err) {
                                                console.log(err)
                                                return res.status(401).json({
                                                            error: 'Token expired.Signup again'
                                                })
                                    } else {
                                                //^if valid save to db
                                                //^get email name and password from token
                                                const { name, email, password } = jwt.decode(
                                                            token
                                                )
                                                const user = new User({
                                                            name,
                                                            email,
                                                            password
                                                })
                                                user.save((err, user) => {
                                                            if (err) {
                                                                        console.log(err)
                                                                        return res.status(401).json({
                                                                                    error: errorHandler(err)
                                                                        })
                                                            } else {
                                                                        return res.status(200).json({
                                                                                    success: true,
                                                                                    message: 'Signup success',
                                                                                    user
                                                                        })
                                                            }
                                                })
                                    }
                        })
            } else {
                        return res.status(401).json({
                                    message: "error please try again after some time"
                        })

            }
}

//^Login

exports.signinController = (req, res) => {
            const { email, password } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                        const firstError = errors.array().map(error => error.msg)[0];
                        return res.status(422).json({
                                    errors: firstError
                        });
            } else {
                        // check if user exist
                        User.findOne({
                                    email
                        }).exec((err, user) => {
                                    if (err || !user) {
                                                return res.status(400).json({
                                                            errors: 'User with that email does not exist. Please signup'
                                                });
                                    }
                                    // authenticate
                                    if (!user.authenticate(password)) {
                                                return res.status(400).json({
                                                            errors: 'Email and password do not match'
                                                });
                                    }
                                    // generate a token and send to client
                                    const token = jwt.sign(
                                                {
                                                            _id: user._id
                                                },
                                                process.env.JWT_SECRET,
                                                {
                                                            expiresIn: '7d'
                                                }
                                    );
                                    const { _id, name, email, role } = user;

                                    return res.json({
                                                token,
                                                user: {
                                                            _id,
                                                            name,
                                                            email,
                                                            role
                                                }
                                    });
                        });
            }
};

//!Forgot password
exports.forgotController = (req, res) => {
            const { email } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                        const firstError = errors.array().map(error => error.msg)[0];
                        return res.status(422).json({
                                    errors: firstError
                        });
            } else {
                        //^Check user exist

                        User.findOne({ email }, (err, user) => {
                                    if (err || !user) {
                                                return res.status(400).json({
                                                            error: 'User with this email not exist'
                                                })
                                    }

                                    const token = jwt.sign({
                                                _id: user._id
                                    }, process.env.JWT_RESET_PASSWORD, {
                                                expiresIn: '10m'
                                    })
                                    //^send email with token
                                    const emailData = {
                                                from: process.env.EMAIL_FROM,
                                                to: email,
                                                subject: `Reset Password`,
                                                html: `
                                    <h1>Please click to reset your password</h1>
                                    <p>${process.env.CLIENT_URL}/password/reset/${token}</p>
                                    <hr/>
                                    <p>This email contains sensitive info</p>
                                    <p>${process.env.CLIENT_URL}</p>
                                    `

                                    }
                                    return user.updateOne({
                                                resetPasswordLink: token
                                    }, (err, success) => {
                                                if (err) {
                                                            return res.status(400).json({
                                                                        error: errorHandler(err)
                                                            })
                                                }
                                                else {
                                                            sendMail.send(emailData).then(sent => {
                                                                        return res.json({
                                                                                    message: "Mail has been sent to reset password"
                                                                        })
                                                            }).catch(e => {
                                                                        return res.json({
                                                                                    message: e.message
                                                                        })
                                                            })
                                                }
                                    })

                        })
            }

}
exports.resetController = (req, res) => {
            const { resetPasswordLink, newPassword } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                        const firstError = errors.array().map(error => error.msg)[0];
                        return res.status(422).json({
                                    errors: firstError
                        });
            } else {
                        if (resetPasswordLink) {
                                    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
                                                if (err) {
                                                            return res.status(400).json({
                                                                        error: 'Link expired.Try again'
                                                            })
                                                }
                                                User.findOne({ resetPasswordLink }, (err, user) => {
                                                            if (err || !user) {
                                                                        return res.status(400).json({
                                                                                    error: 'Something went wrong'
                                                                        })
                                                            }
                                                            const updatedFields = {
                                                                        password: newPassword,
                                                                        resetPasswordLink: ''
                                                            }
                                                            user = _.extend(user, updatedFields);
                                                            user.save((err, result) => {
                                                                        if (err) {
                                                                                    return res.status(400).json({
                                                                                                error: 'Error resetting password'
                                                                                    })
                                                                        }
                                                                        return res.json({
                                                                                    message: 'Successfully updated password'
                                                                        })
                                                            })
                                                })
                                    })
                        }
            }
}

//^Google OAuth 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
exports.googleController = (req, res) => {
            const { idToken } = req.body;
            //^Token from request

            //^Verify Token
            client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
                        .then(response => {
                                    const { email_verified, name, email } = response.payload
                                    console.log(name, email);
                                    //^Checking email verification
                                    if (email_verified) {
                                                User.findOne({ email }).exec((err, user) => {
                                                            //Find user already exists
                                                            if (user) {
                                                                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                                                                                    expiresIn: '7d'
                                                                        })

                                                                        const { _id, email, name, role } = user;
                                                                        return res.json({
                                                                                    token,
                                                                                    user: { _id, email, name, role }
                                                                        })
                                                            } else {
                                                                        //^if  user does not exist save to db 


                                                                        let password = email + process.env.JWT_SECRET;
                                                                        user = new User({ name, email, password })
                                                                        user.save((err, data) => {
                                                                                    if (err) {
                                                                                                console.log(err, err.data, err.response.data)
                                                                                                return res.status(400).json({
                                                                                                            error: errorHandler(err)
                                                                                                })
                                                                                    }
                                                                                    const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
                                                                                                expiresIn: '7d'
                                                                                    })
                                                                                    const { _id, email, name, role } = data;
                                                                                    return res.json({
                                                                                                token,
                                                                                                user: { _id, email, name, role }
                                                                                    })
                                                                        })
                                                            }
                                                })
                                    } else {
                                                return res.status(400).json({
                                                            error: 'Google login failed!Try again'
                                                })
                                    }
                        })
}