const express = require('express');
const authController = require('../controllers/auth.controller')
 
const router = express.Router();

router.get('/login' , authController.getLogin)

module.exports = router

