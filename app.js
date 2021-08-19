const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Campground = require("./models/campground");
const Review = require('./models/review')
const User = require('./models/user')

const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js');


// Require Routes
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds'); 
const reviewRoutes = require('./routes/reviews'); 


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

//App configuration
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: true})); //Needed to pass the response body during instanciation
app.use(methodOverride('_method')); //Neded for delete and put
app.use(express.static(path.join(__dirname, 'public'))); // to be able to serve the public directory in our boilerplate ejs file
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!', //this 'secret' is to sign cookies and verify its integrity: something hasnt changed
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //for persistent login sessions
//These methods were added by the plugin in user.js
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middlewear for flash on every single request: 'global variables' on every req/ templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.get('/fakeUser', async(req, res) => {
    const user = new User({
        email: 'sam@ucd.com',
        username: 'sammmm'
    });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);

})

//Using routes in appplication
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);


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