console.clear()

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHbs = require('express-handlebars')
const sequelize = require('./util/database')

const app = express();

// --------- For ejs templating engines ---------
app
    .set('view engine', 'ejs')
    .set('views', 'views');
// --------- For ejs templating engines ---------


// // --------- For Handlebar templating engines ---------
// app
//     .engine('hbs', expressHbs({ layoutsDir: 'views/layouts/', defaultLayout: 'main-layout.hbs', extname: 'hbs' }))
//     .set('view engine', 'hbs')
//     .set('views', 'views');
// // --------- For Handlebar templating engines ---------


// // --------- For pug templating engines ---------
// app
//     .set('view engine', 'pug')
//     .set('views', 'views');
// // --------- For pug templating engines ---------


// app.use() is used to create middlerwares
// next() Allows req to travel to another middlerware in the line

const adminRoutes = require('./routes/admin.route');
const shopRoutes = require('./routes/shop.route');
const { pageNotFound } = require('./controllers/404Error.controller');

app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(express.static(path.join(__dirname, 'public')));

app
    .use('/admin', adminRoutes)
    .use(shopRoutes);

app.use(pageNotFound);

sequelize
    .sync()
    .then(result => {
        // console.log(result)
        app.listen(3000);
    })
    .catch(err => { console.log(err) });

