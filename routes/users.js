const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const User = require("../models/user");
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(users.userLogin);

router.get('/logout',users.userLogout)

module.exports = router;