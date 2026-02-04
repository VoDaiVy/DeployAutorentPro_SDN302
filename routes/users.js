const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Hiển thị form Đăng ký (GET /users/register)
router.get('/register', authController.getRegisterPage);

// Hiển thị form Đăng nhập (GET /users/login)
router.get('/login', authController.getLoginPage);

module.exports = router;