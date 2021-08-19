const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){ //method coming from passport

        //store rhw url they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

////////////////////////////////////////////////////////

//Middlewear functions for CAMPGROUNDS
module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        //iterate over errors and create a single string error message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next(); 
    }
}
//checking for permissions
module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    //checking permissions
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

////////////////////////////////////////////////////////

//Middlewear functions for REVIEWS
module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error){
        //iterate over errors and create a single string error message
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next(); 
    }   
}

//checking for permissions
module.exports.isReviewAuthor = async(req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    //checking permissions
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
