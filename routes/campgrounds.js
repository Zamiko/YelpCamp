const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')


//ROUTE NAME: INDEX
router.get('/', catchAsync(campgrounds.index));

//ROUTE NAME: NEW
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//ROUTE NAME: CREATE
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

//ROUTE NAME: SHOW
router.get('/:id', catchAsync(campgrounds.showCampground));

//ROUTE NAME: EDIT
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//ROUTE NAME: UPDATE
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

//ROUTE NAME: DELETE
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;