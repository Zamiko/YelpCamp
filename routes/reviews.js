const express = require('express');
const router = express.Router({mergeParams: true}); //to get acces to campground "id"
 
const Review = require('../models/review')
const Campground = require("../models/campground");

const {reviewSchema} = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//Middlewear function 
const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error){
        //iterate over errors and create a single string error message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next(); 
    }   
}

//ROUTE NAME: CREATE
router.post('/', validateReview, catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//ROUTE NAME: DELETE
router.delete('/:reviewId', catchAsync( async(req, res) => {
    const {id, reviewId} = req.params;
    //using mongo operator $pull: take anything from reviews with given 'reviewId' and take it out or 'pull' it out
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;