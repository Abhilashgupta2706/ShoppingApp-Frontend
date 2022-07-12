console.clear()
console.log('--------------- Concole Cleared ---------------')

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHbs = require('express-handlebars')
const sequelize = require('./util/database')
const Product = require('./models/product.model');
const User = require('./models/user.model');
const CartItem = require('./models/cart-item.model');
const Cart = require('./models/cart.model');
const Order = require('./models/order.model');
const OrderItem = require('./models/order-items.model');

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
    .use(express.static(path.join(__dirname, 'public')))
    .use((req, res, next) => {
        User
            .findByPk(1)
            .then(user => {
                // console.log("User: ", user.dataValues)
                req.user = user;
                next();
            })
            .catch(err => { console.log(err) });

    });

app
    .use('/admin', adminRoutes)
    .use(shopRoutes);

app.use(pageNotFound);


Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });



sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        return User.findByPk(1)
        // console.log(result)
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'admin',
                email: 'admi@gmail.com'
            });
        };
        return user;
    })
    .then(user => {
        // console.log(user.dataValues);
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => { console.log(err) });

