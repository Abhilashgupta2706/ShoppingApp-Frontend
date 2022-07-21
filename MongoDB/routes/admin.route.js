const express = require('express')
const { body } = require('express-validator/check');
const adminController = require('../controllers/admin.controller')

const isAuth = require('../middleware/isAuth.middleware')

const router = express.Router()

router.get('/products', isAuth, adminController.getProducts);

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', [
    body('title')
        .isString()
        .isLength({ min: 10 })
        .withMessage('Title must be Alphanumeric with length minimum 10 Characters.')
        .trim(),

    body('imageUrl')
        .isURL()
        .withMessage('Please enter a valid URL for the image.')
        .custom((value, { req }) => {
            if (value == '') {
                throw new Error('URL for product image is required.')
            }
            return true;
        }),

    body('price')
        .isFloat()
        .withMessage('Must enter valid price.')
        .isLength({ min: 1 })
        .custom((value, { req }) => {
            if (value == 0) {
                throw new Error('Price for the product should not be zero.')
            }
            return true;
        })
        .trim(),

    body('description')
        .isLength({ min: 10, max: 200 })
        .withMessage('Description must be between 10 to 200 Characters.')
        .trim(),
], isAuth, adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/edit-product', [
    body('title')
        .isString()
        .isLength({ min: 10 })
        .withMessage('Title must be Alphanumeric with length minimum 10 Characters.')
        .trim(),

    body('imageUrl')
        .isURL()
        .withMessage('Please enter a valid URL for the image.')
        .custom((value, { req }) => {
            if (value == '') {
                throw new Error('URL for product image is required.')
            }
            return true;
        }),

    body('price')
        .isFloat()
        .withMessage('Must enter valid price.')
        .isLength({ min: 1 })
        .custom((value, { req }) => {
            if (value == 0) {
                throw new Error('Price for the product should not be zero.')
            }
            return true;
        })
        .trim(),

    body('description')
        .isLength({ min: 10, max: 200 })
        .withMessage('Description must be between 10 to 200 Characters.')
        .trim(),
], isAuth, adminController.postEditProduct)

router.post('/delete-product', isAuth, adminController.postDeleteProduct)


module.exports = router;