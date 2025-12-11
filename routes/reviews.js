const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require("../models/campground");
const Review = require('../models/review');

const {reviewSchema} = require('../schemas.js');

//Middleware
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}

//Routes
router.post("/",validateReview,catchAsync(async(req,res)=>{
    const review = new Review(req.body.review);
    const camp = await Campground.findById(req.params.id);
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success','Added new review!');
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete("/:reviewId",catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;