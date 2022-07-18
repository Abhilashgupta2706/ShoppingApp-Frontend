// const Cart = require('../models/cart.model')
const Product = require('../models/product.model')

exports.getIndex = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'My Shop',
                path: '/'
            })
        })
        .catch(err => { console.log(err) });
}

exports.getProducts = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            })
        })
        .catch(err => { console.log(err) });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product
        .findById(prodId)
        .then(product => {
            // console.log("Product Matched:", product.dataValues)
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => { console.log(err) });
}



exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(products => {
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch(err => { console.log(err) });
};

exports.postCart = (req, res, next) => {
    const { productId } = req.body;

    Product
        .findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            // console.log('Result:', result);
            res.redirect('/cart')
        })
        .catch(err => { console.log(err) });
};

exports.postCartDeleteItem = (req, res, next) => {
    const { productId } = req.body

    req.user
        .deleteItemFromCart(productId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => { console.log(err) });

}

exports.postOrder = (req, res, next) => {
    let fetchedCard;
    req.user
        .addOrder()
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => { console.log(err) });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => { console.log(err) });
}
