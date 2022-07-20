const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true'
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    const { email, password } = req.body

    User
        .findOne({ email: email })
        .then(user => {
            if (!user) {
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
        isAuthenticated: false
    });
};

exports.postSignUp = (req, res, next) => {
    const { email, password, confirmPassword } = req.body

    User
        .findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
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
                });

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
