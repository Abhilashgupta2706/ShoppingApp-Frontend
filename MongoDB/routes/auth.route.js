const express = require('express');
const authController = require('../controllers/auth.controller')

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignUp);
router.post('/signup', authController.postSignUp);

router.post('/logout', authController.postLogout);

module.exports = router;

