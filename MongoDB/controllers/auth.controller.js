const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
const crypto = require('crypto');

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
        errorMessage: req.flash('error')
    });
};

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    const { email, password } = req.body

    User
        .findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid Email or Password!')
                return res.redirect('/login');
            };

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

                    req.flash('error', 'Invalid Password!')
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login');
                });
        })
        .catch(err => { console.log(err) });
};

exports.getSignUp = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true'
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        path: '/signup',
        errorMessage: req.flash('error')
    });
};

exports.postSignUp = (req, res, next) => {
    const { email, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords does not match, try again.')
        return res.redirect(`/signup`)
    }

    User
        .findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email already exist, please use different one.')
                return res.redirect('/signup')
            }

            return bcrypt
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
                .catch(err => { console.log((err)) });

        })
        .catch(err => { console.log((err)) });
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
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    const { email } = req.body
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
                if (email == '') {
                    req.flash('error', 'Please enter your email.')
                    return res.redirect('/reset');
                };

                if (!user) {
                    req.flash('error', 'Email not registered')
                    return res.redirect('/reset');
                };

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
            .catch(err => { console.log((err)) });
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
        .catch(err => { console.log((err)) });
};

exports.postNewPassword = (req, res, next) => {
    let { newPassword, confirmPassword, userId, passwordToken } = req.body;

    let userToReset;

    if (newPassword !== confirmPassword) {
        req.flash('error', 'Passwords does not match, try again.')
        return res.redirect(`/reset/${passwordToken}`)
    }

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
        .catch(err => { console.log((err)) });
};