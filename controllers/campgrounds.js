
const Campground = require("../models/campground");

//ROUTE NAME: INDEX
module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

//ROUTE NAME: NEW
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

//ROUTE NAME: CREATE
module.exports.createCampground = async(req, res) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; //automatically added in when doing the auth steps
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

//ROUTE NAME: SHOW
module.exports.showCampground = async(req, res) => {
    const { id } = req.params;
    
    //populate all reviews from the campground we are finding, 
    //and from each review populate its author.
    //sepreately, populate the author of the campground 
    const campground = await Campground.findById(id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author');

    if(!campground){
        req.flash('error', 'Cannot find campground :(');
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/show', {campground})
};

//ROUTE NAME: EDIT
module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find campground :(');
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit', {campground})
};

//ROUTE NAME: UPDATE
module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

//ROUTE NAME: DELETE
module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds')
};