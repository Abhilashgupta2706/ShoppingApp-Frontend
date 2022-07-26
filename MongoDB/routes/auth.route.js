const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/isAuth.middleware');
const User = require('../models/user.model');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        // .normalizeEmail()
        .custom((value, { req }) => {
            return User
                .findOne({ email: value })
                .then(user => {
                    if (!user) {
                        return Promise.reject('Invalid Email or Password!')
                    };
                })
        })
], authController.postLogin);

router.get('/signup', authController.getSignUp);
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        // .normalizeEmail()
        .custom((value, { req }) => {
            // if ((value === 'testing@123.gmail')) {
            //     throw new Error('This email address is forbidden.')
            // }
            // return true;
            return User
                .findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exist, please use different one.')
                    }
                });
        }),

    body('password', 'Please enter a password with only numbers and text and at least 8 characters')
        .isLength({ min: 8 })
        .isAlphanumeric(),
    // .trim(),

    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords does not match, try again.')
            }
            return true;
        })
], authController.postSignUp);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset)
router.post('/reset', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        // .normalizeEmail()
        .custom((value, { req }) => {
            return User
                .findOne({ email: value })
                .then(user => {
                    if (!user) {
                        return Promise.reject('Email is not registered, try again.')
                    };
                });
        }),
], authController.postReset);

router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', [
    body('newPassword', 'Please enter a password with only numbers and text and at least 8 characters')
        .isLength({ min: 8 })
        .isAlphanumeric(),
    // .trim(),

    body('confirmPassword')
        // .trim()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords does not match, try again.')
            }
            return true;
        })
], authController.postNewPassword);

module.exports = router;

