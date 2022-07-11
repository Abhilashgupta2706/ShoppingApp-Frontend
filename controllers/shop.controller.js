const Cart = require('../models/cart.model')
const Product = require('../models/product.model')

exports.getIndex = (req, res, next) => {
    Product
        .findAll()
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
        .findAll()
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

    // Product
    //     .findAll({
    //         where: {
    //             id: prodId
    //         }
    //     })
    //     .then(products => {
    //         console.log(products)
    //         res.render('shop/product-detail', {
    //             product: products[0],
    //             pageTitle: products[0].title,
    //             path: '/products'
    //         })
    //     })
    //     .catch(err => { console.log(err) });

    Product
        .findByPk(prodId)
        .then(product => {
            console.log("Product Matched:", product.dataValues)
            res.render('shop/product-detail', {
                product: product,
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
