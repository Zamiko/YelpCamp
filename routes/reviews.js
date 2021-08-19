const express = require('express');
const router = express.Router({mergeParams: true}); //to get acces to campground "id"
 
const Review = require('../models/review')
const Campground = require("../models/campground");

const {reviewSchema} = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const {validateReview, isLoggedIn ,isReviewAuthor} =  require('../middleware');
const { renderEditForm } = require('../controllers/campgrounds');

const reviews = require('../controllers/reviews');


//ROUTE NAME: CREATE
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//ROUTE NAME: DELETE
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;