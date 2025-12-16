const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require("../models/campground");
const {campgroundSchema} = require('../schemas.js');
const {checkUser, requireAuth} = require("../middleware");

//Middleware
const validateCampground = (req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}
//Routes
router.post("/",requireAuth,validateCampground, catchAsync(async(req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError(400, "Invalid CampGround Data");
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success','Successfully created a new campground!');
    res.redirect(`/campgrounds/${camp._id}`);
    }));

router.get("/",catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
}));


router.get("/new",requireAuth,(req,res)=>{
    res.render("campgrounds/new");
});

router.get("/:id",catchAsync(async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error','Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show",{camp});
}));

router.get("/:id/edit",requireAuth,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit",{camp});
}));

router.delete("/:id",requireAuth,catchAsync(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id).populate('reviews');
    req.flash('success','Successfully deleted campground!');
    res.redirect("/campgrounds");
}));

router.put("/:id",requireAuth,validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success','Successfully updated campground!');
    res.redirect(`${camp._id}`);
}));

module.exports = router;