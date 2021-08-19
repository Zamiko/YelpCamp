const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');


/////////////////// REGISTER ///////////////////
//ROUTE NAME: NEW
router.get('/register', (req, res) =>{
    res.render('users/register');
})

//ROUTE NAME: CREATE
router.post('/register', catchAsync(async(req, res) => {
    try{
        const{email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); //this method hashes and salts the password
        //Have to activate a logged in session with passport after registering which in irl will keep u logged in
        req.login(registeredUser, err => { //neded by docs
            if(err) return next(err); 
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register')
    }    
}));

/////////////////// LOGIN ///////////////////
router.get('/login', (req, res) =>{
    res.render('users/login');
})

router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), (req, res) =>{
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

/////////////////// LOGOUT ///////////////////
router.get('/logout', (req, res) =>{
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
})

module.exports = router;