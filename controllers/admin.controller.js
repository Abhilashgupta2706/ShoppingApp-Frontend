const Product = require('../models/product.model')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false
    });
};


exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(null, title, imageUrl, price, description);
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => { console.log(err) });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (!editMode) {
        return res.redirect('/')
    };

    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/')
        };

        res.render('admin/edit-product', {
            pageTitle: "Edit Product",
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('admin/products', {
                prods: rows,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => { console.log(err) });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    const updatedProduct = new Product(productId, updatedTitle, updatedImageUrl, updatedPrice, updatedDescription);
    updatedProduct.save();
    return res.redirect('/admin/products');

};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId
    Product.deletebyId(productId)
    return res.redirect('/admin/products')
};