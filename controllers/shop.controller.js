const Cart = require('../models/cart.model')
const Product = require('../models/product.model')

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows]) => {
            res.render('shop/index', {
                prods: rows,
                pageTitle: 'My Shop',
                path: '/'
            })
        })
        .catch(err => { console.log(err) });

}

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows]) => {
            res.render('shop/product-list', {
                prods: rows,
                pageTitle: 'All Products',
                path: '/products'
            })
        })
        .catch(err => { console.log(err) });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(([product]) => {
            // console.log(product)
            res.render('shop/product-detail', {
                product: product[0],
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => { console.log(err) });
}



exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = []
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if (cartProductData) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty })
                }
            }
            // console.log("Cart Products:", cartProducts)
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            })
        })
    })
}

exports.postCart = (req, res, next) => {
    const { productId } = req.body
    Product.findById(productId, (product) => {
        Cart.addProduct(productId, product.price)
    })
    res.redirect('/cart')
    // res.render('shop/cart', {
    //     pageTitle: 'Your Cart',
    //     path: '/cart'
    // })
}

exports.postCartDeleteItem = (req, res, next) => {
    const { productId } = req.body
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price)
        res.redirect('/cart')
    })

}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    })
}
