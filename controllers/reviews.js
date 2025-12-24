const Campground = require("../models/campground");
const Review = require('../models/review');

module.exports.addReview = async(req,res)=>{
    const review = new Review(req.body.review);
    const camp = await Campground.findById(req.params.id);
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success','Added new review!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}