// const Cart = require('../models/cart.model')
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {

    const pageNum = +req.query.page || 1;
    let totalItems;

    Product
        .find()
        .countDocuments()
        .then(numOfProducts => {
            totalItems = numOfProducts;

            return Product
                .find()
                .skip((pageNum - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'My Shop',
                path: '/',
                errorMessage: req.flash('error'),
                currentPage: pageNum,
                hasNextPage: ITEMS_PER_PAGE * pageNum < totalItems,
                hasPreviousPage: pageNum > 1,
                nextPage: pageNum + 1,
                previousPage: pageNum - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProducts = (req, res, next) => {
    const pageNum = +req.query.page || 1;
    let totalItems;

    Product
        .find()
        .countDocuments()
        .then(numOfProducts => {
            totalItems = numOfProducts;

            return Product
                .find()
                .skip((pageNum - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                errorMessage: req.flash('error'),
                currentPage: pageNum,
                hasNextPage: ITEMS_PER_PAGE * pageNum < totalItems,
                hasPreviousPage: pageNum > 1,
                nextPage: pageNum + 1,
                previousPage: pageNum - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        // .execPopulate()
        .then(user => {
            let products = user.cart.items;
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
            console.log('products')
            console.log(products)
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCartDeleteItem = (req, res, next) => {
    const { productId } = req.body

    req.user
        .removeFromCart(productId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        // .execPopulate()
        .then(user => {
            let products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getOrders = (req, res, next) => {

    Order
        .find({
            'user.userId': req.user._id
        })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params;

    Order
        .findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found for your account'))
            };

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized User!'))
            };

            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();

            res
                .setHeader('Content-Type', 'application/pdf')
                .setHeader('Content-Disposition', `inline; filename=${invoiceName}`);

            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc
                .fontSize(22)
                .text(`Invoice for OrderId: ${orderId}`, {
                    underline: true
                });

            pdfDoc.fontSize(14);

            let totalPrice = 0;
            order.products.forEach((prod, index) => {
                pdfDoc
                    .fontSize(14)
                    .text(`
${index + 1}. Product Name: ${prod.product.title}
    Quantity: ${prod.quantity}
    Price per product: $${prod.product.price}
    Final Price: ${prod.quantity * prod.product.price}`)

                totalPrice += prod.quantity * prod.product.price
            });

            pdfDoc
                .fontSize(20)
                .text(`\nTotal Price: $${totalPrice}`);

            pdfDoc.end();

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
