
const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary");

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
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})); //array of images
    campground.author = req.user._id; //automatically added in when doing the auth steps
    await campground.save();
    //console.log(campground);
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
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); //array of images
    campground.images.push(...imgs); //array of images
    await campground.save();
    console.log('=========================================')
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages){ //delete from backend: cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in : req.body.deleteImages}}}})
        console.log(campground)
    }
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

