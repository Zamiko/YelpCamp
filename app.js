const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require("./models/campground");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('./models/review')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser : true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Needed to pass the response body during instanciation
app.use(express.urlencoded({extended: true}));

app.use(methodOverride('_method'));

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

//HOME
app.get('/', (req, res) => {
    res.render('home')
})

///////////// REST ROUTES /////////////
//ROUTE NAME: INDEX
app.get('/campgrounds', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

//ROUTE NAME: NEW
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//ROUTE NAME: CREATE
app.post('/campgrounds', validateCampground, catchAsync(async(req, res) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//ROUTE NAME: SHOW
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground})
}))

//ROUTE NAME: EDIT
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground})
}))

//ROUTE NAME: UPDATE
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

//ROUTE NAME: DELETE
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async(req, res) => {
    const {id, reviewId} = req.params;
    //using mongo operator $pull: take anything from reviews with given 'reviewId' and take it out or 'pull' it out
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

//404 Error
app.all('*', (req,res,next) => {
    next(new ExpressError("Page not found", 404));
})

//Custom Error handling
app.use((err,req,res, next) =>{
    const {statusCode = 500} = err;
    if (!err.message) err.message ="Something went wrong :("
    res.status(statusCode).render('error', {err});
})


app.listen(3000, ()=>{
    console.log('Serving on Port 300')
})