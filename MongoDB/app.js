console.clear()
console.log('--------------- Concole Cleared ---------------');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose')
const User = require('./models/user.model');
require('dotenv').config();

const app = express();

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
    .use((req, res, next) => {
        User
            .findById('62d4f3baecabfd3a95762b5a')
            .then(user => {
                console.log('MiddleWare Console:', user)
                req.user = user;
                next()
            })
            .catch(err => { console.log(err) });

    })
    ;

app
    .use('/admin', adminRoutes)
    .use(shopRoutes)
    .use(authRoutes);

app.use(pageNotFound);


mongoose
    .connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@nodejsudemy.hccnuys.mongodb.net/shop?retryWrites=true&w=majority`)
    .then(result => {
        console.log('Connected to MongoDB Atlas Cloud Server!');

        User
            .findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        username: 'Admin',
                        email: 'admin@role.in',
                        cart: {
                            items: []
                        }
                    });

                    user.save()
                }
            });

        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    });