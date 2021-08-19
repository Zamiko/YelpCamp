const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

/////////////////// REGISTER ///////////////////
router.get('/register', users.renderRegister)
router.post('/register', catchAsync(users.register));

/////////////////// LOGIN ///////////////////
router.get('/login', users.renderLogin)

router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), users.login)

/////////////////// LOGOUT ///////////////////
router.get('/logout', users.logout)

module.exports = router;