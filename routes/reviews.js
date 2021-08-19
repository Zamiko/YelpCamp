const express = require('express');
const router = express.Router({mergeParams: true}); //to get acces to campground "id"
 
const Review = require('../models/review')
const Campground = require("../models/campground");

const {reviewSchema} = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const {validateReview, isLoggedIn ,isReviewAuthor} =  require('../middleware')


//ROUTE NAME: CREATE
router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//ROUTE NAME: DELETE
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
    const {id, reviewId} = req.params;
    //using mongo operator $pull: take anything from reviews with given 'reviewId' and take it out or 'pull' it out
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;