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
const multer = require('multer');

const User = require('./models/user.model');
require('dotenv').config();

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Math.random().toString(36).substring(2, 10) + '_' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

app
    .set('view engine', 'ejs')
    .set('views', 'views');


const adminRoutes = require('./routes/admin.route');
const authRoutes = require('./routes/auth.route');
const shopRoutes = require('./routes/shop.route');
const errorController = require('./controllers/error.controller');
const { pageNotFound } = require('./controllers/404Error.controller');

app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
    .use(express.static(path.join(__dirname, 'public')))
    .use('/images', express.static(path.join(__dirname, 'images')))
    .use(session({
        secret: 'This is my secret string for session',
        resave: false,
        saveUninitialized: false,
        store: store
    }))
    .use(csrfProtection)
    .use(flash())
    .use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.csrfToken = req.csrfToken();
        next();
    })
    .use((req, res, next) => {

        if (!req.session.user) { return next() };

        User
            .findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return next();
                };

                req.user = user
                next();
            })
            .catch(err => { next(new Error(err)) });
    });

app
    .use('/admin', adminRoutes)
    .use(shopRoutes)
    .use(authRoutes);

app.get('/500', errorController.get500);
app.use(pageNotFound);

app.use((err, req, res, next) => {
    // res.redirect('/500')
    res
        .status(500)
        .render('500-Error', {
            pageTitle: 'Internal Server Error - 500',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        });
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(result => {
        console.log('Connected to MongoDB Atlas Cloud Server!');
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    });