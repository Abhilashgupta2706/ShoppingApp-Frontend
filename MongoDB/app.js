console.clear()
console.log('--------------- Concole Cleared ---------------');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const User = require('./models/user.model');
require('dotenv').config();

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

app
    .set('view engine', 'ejs')
    .set('views', 'views');


const adminRoutes = require('./routes/admin.route');
const authRoutes = require('./routes/auth.route');
const shopRoutes = require('./routes/shop.route');
const { pageNotFound } = require('./controllers/404Error.controller');

app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(express.static(path.join(__dirname, 'public')))
    .use(session({
        secret: 'This is my secret string for session',
        resave: false,
        saveUninitialized: false,
        store: store
    }))
    .use(csrfProtection)
    .use(flash())
    .use((req, res, next) => {

        if (!req.session.user) { return next() };

        User
            .findById(req.session.user._id)
            .then(user => {
                req.user = user
                next();
            })
            .catch(err => { console.log(err) });
    });

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app
    .use('/admin', adminRoutes)
    .use(shopRoutes)
    .use(authRoutes);

app.use(pageNotFound);


mongoose
    .connect(process.env.MONGODB_URI)
    .then(result => {
        console.log('Connected to MongoDB Atlas Cloud Server!');
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    });