const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require("../models/campground");
const {campgroundSchema} = require('../schemas.js');

//Middlewear function 
const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        //iterate over errors and create a single string error message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next(); 
    }
}

//ROUTE NAME: INDEX
router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

//ROUTE NAME: NEW
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//ROUTE NAME: CREATE
router.post('/', validateCampground, catchAsync(async(req, res) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//ROUTE NAME: SHOW
router.get('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find campground :(');
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/show', {campground})
}))

//ROUTE NAME: EDIT
router.get('/:id/edit', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find campground :(');
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit', {campground})
}))

//ROUTE NAME: UPDATE
router.put('/:id', validateCampground, catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//ROUTE NAME: DELETE
router.delete('/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds')
}))

module.exports = router;