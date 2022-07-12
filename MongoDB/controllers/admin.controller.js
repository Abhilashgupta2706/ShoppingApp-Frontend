const Product = require('../models/product.model')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false
    });
};


exports.postAddProduct = (req, res, next) => {
    const { title, price, description, imageUrl } = req.body;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);

    product
        .save()
        .then(result => {
            console.log("Data Added to Database")
            res.redirect('/')
        })
        .catch(err => { console.log(err) });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (!editMode) {
        return res.redirect('/')
    };

    const prodId = req.params.productId;

    Product
        .findById(prodId)
        .then(product => {

            if (!product) {
                return res.redirect('/')
            }

            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            })
        })
        .catch(err => { console.log(err) });
};

exports.getProducts = (req, res, next) => {
    Product
        .fetchAll()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => { console.log(err) });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;

    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedImageUrl = req.body.imageUrl;

    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, productId)
    product
        .save()
        .then(result => {
            console.log("Product Updated")
            return res.redirect('/admin/products');
        })
        .catch(err => { console.log(err) });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product
        .deleteById(prodId)
        .then(() => {
            console.log('PRODUCT DESTROYED!')
            return res.redirect('/admin/products')
        })
        .catch(err => { console.log(err) });

};