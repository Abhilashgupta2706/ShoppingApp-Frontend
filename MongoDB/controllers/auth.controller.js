const User = require('../models/user.model')

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
    User
        .findById('62d4f3baecabfd3a95762b5a')
        .then(user => {
            req.session.isLoggedIn = true;
            console.log('MiddleWare Console:', user)
            req.session.user = user;
            req.session.save(err => {
                console.log(err)
                res.redirect('/');
            });
        })
        .catch(err => { console.log(err) });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.clear();
        console.log(err)
        res.redirect('/');
    })
};
