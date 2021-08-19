const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require('connect-flash')

const Campground = require("./models/campground");
const Review = require('./models/review')

const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js');


// Require Routes
const campgrounds = require('./routes/campgrounds'); 
const reviews = require('./routes/reviews'); 


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser : true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(methodOverride('_method')); //Neded for delete and put
app.use(express.static(path.join(__dirname, 'public'))); // to be able to serve the public directory in our boilerplate ejs file
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

//Middlewear for flash on every single request
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


//Using routes in appplication
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews);


//HOME ROUTE: needed? 
app.get('/', (req, res) => {
    res.render('home')
});

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