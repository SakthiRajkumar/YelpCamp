const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const campgrounds = require('../controllers/campgrounds');
const {campgroundSchema} = require('../schemas.js');
const {checkUser, requireAuth,validateCampground,isAuthor} = require("../middleware");
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});


//Routes
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(requireAuth,upload.array('image'),validateCampground, catchAsync(campgrounds.createCamp));
    // .post(upload.array('image'),(req,res)=>{
    //     console.log(req.body,req.files,req.files[0].path);
    //     res.send("IR WORKED?!!")
    // })

router.get("/new",requireAuth,campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCamp))
    .put(requireAuth,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.editCamp))
    .delete(requireAuth,isAuthor,catchAsync(campgrounds.deleteCamp));

router.get("/:id/edit",requireAuth,isAuthor,catchAsync(campgrounds.renderEditForm));


module.exports = router;