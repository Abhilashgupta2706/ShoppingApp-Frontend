const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const { SenderEmailID, SenderAppPasssword } = require('./nodeMailerConfig');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: SenderEmailID,
        pass: SenderAppPasssword,
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true'
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error'),
        oldInputData: {
            email: '',
            password: '',
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    const { email, password } = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: errors.array()[0].msg,
                oldInputData: {
                    email: email,
                    password: password,
                },
                validationErrors: errors.array()
            });
    };

    User
        .findOne({ email: email })
        .then(user => {
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        console.log('User LoggedIn:', user)
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/');
                        });
                    };

                    return res
                        .status(422)
                        .render('auth/login', {
                            pageTitle: 'Login',
                            path: '/login',
                            errorMessage: 'Invalid Password!',
                            oldInputData: {
                                email: email,
                                password: password,
                            },
                            validationErrors: [{ param: 'password' }]
                        });
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getSignUp = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true'
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        path: '/signup',
        errorMessage: req.flash('error'),
        oldInputData: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
};

exports.postSignUp = (req, res, next) => {
    const { email, password, confirmPassword } = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/signup', {
                pageTitle: 'SignUp',
                path: '/signup',
                errorMessage: errors.array()[0].msg,
                oldInputData: {
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                },
                validationErrors: errors.array()
            });
    };

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            });

            return user.save();
        })
        .then(result => {
            res.redirect('/login')

            return transporter
                .sendMail({
                    from: `Malicious Person 🧑🏻‍💻 <${SenderEmailID}>`,
                    to: email,
                    subject: "Mail from Shopping App NodeJS ✔",
                    text: `You have successfully registered on our Shopping App
                            Your Credentials are:
                            Email: ${email}
                            Password: ${password}`,
                    html: `<h1>Thank you for registering yourself on our application</h1>
                            <h3>
                            You have successfully registered on our 
                            <a href="https://github.com/Abhilashgupta2706/ShoppingApp-NodeJS" target="_blank">Shopping
                            App</a>
                            </h3>
                            <p>Your Credentials are:</p>
                            <p>Email: <strong>${email}</strong></p>
                            <p>Password: <strong>${password}</strong></p>`,
                })
                .then(result => {
                    console.log('Email Successfully Sended')
                })
                .catch(err => { console.log((err)) });

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.clear();
        console.log(err)
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    res.render('auth/resetPassword', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error'),
        oldInputData: {
            email: '',
        }
    });
};

exports.postReset = (req, res, next) => {
    const { email } = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array()[0])
        return res
            .status(422)
            .render('auth/resetPassword', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: errors.array()[0].msg,
                oldInputData: {
                    email: email,
                }
            });
    };

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Error while resetting password, please try again.')
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        User
            .findOne({ email: email })
            .then(user => {
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/login');

                return transporter
                    .sendMail({
                        from: `Malicious Person 🧑🏻‍💻 <${SenderEmailID}>`,
                        to: email,
                        subject: "Password Reset for Shopping App NodeJS 🔑",
                        html: `<h3>Your request to reset the password for <strong>${email}</strong> recieved.</h3>
                        <h4>Click this 
                        <a href="http://localhost:3000/reset/${token}" target="_blank">link</a>
                         to reset your password</h4>
                        <p style='color:red;'>Note: This link is only valid for 1 hour</p>`
                    });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {

    let { token } = req.params;

    User.
        findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        })
        .then(user => {
            res.render('auth/newPassword', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postNewPassword = (req, res, next) => {
    let { newPassword, userId, passwordToken } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return User.
            findOne({
                resetToken: passwordToken,
                resetTokenExpiration: { $gt: Date.now() }
            })
            .then(user => {
                res
                    .status(422)
                    .render('auth/newPassword', {
                        pageTitle: 'New Password',
                        path: '/new-password',
                        errorMessage: errors.array()[0].msg,
                        userId: user._id.toString(),
                        passwordToken: passwordToken
                    });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    };

    let userToReset;

    User.
        findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        })
        .then(user => {
            userToReset = user

            // bcrypt
            //     .compare(user.password, newPassword)
            //     .then(doMatch => {
            //         if (doMatch) {
            //             req.flash('error', 'Choose password different from old password.')
            //             return res.redirect('/login');
            //         };
            //     })
            //     .catch(err => { console.log((err)) });

            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            userToReset.password = hashedPassword;
            userToReset.resetToken = undefined;
            userToReset.resetTokenExpiration = undefined;
            return userToReset.save();
        })
        .then(result => {
            res.redirect('/login')

            return transporter
                .sendMail({
                    from: `Malicious Person 🧑🏻‍💻 <${SenderEmailID}>`,
                    to: userToReset.email,
                    subject: "Mail from Shopping App NodeJS ✔",
                    html: `<h1>Password reset successful</h1>
                    <h3>
                    Password for account <strong>${userToReset.email}</strong> has been reset successfully for our
                    <a href="https://github.com/Abhilashgupta2706/ShoppingApp-NodeJS" target="_blank">Shopping
                    App</a>
                    </h3>
                    <p>Your new credentials are:</p>
                    <p>Email: <strong>${userToReset.email}</strong></p>
                    <p>Password: <strong>${newPassword}</strong></p>`,
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};