const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');

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
