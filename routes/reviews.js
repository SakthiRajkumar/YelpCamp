const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const reviews = require('../controllers/reviews');
const Campground = require("../models/campground");
const Review = require('../models/review');

const {validateReview, requireAuth,isReviewAuthor} = require("../middleware");


//Routes
router.post("/",requireAuth,validateReview,catchAsync(reviews.addReview));

router.delete("/:reviewId",requireAuth,isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;