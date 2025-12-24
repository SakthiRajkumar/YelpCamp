const Campground = require("../models/campground");
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});

    res.render("campgrounds/index",{campgrounds});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("campgrounds/new");
}

module.exports.createCamp = async(req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError(400, "Invalid CampGround Data");
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.features[0].geometry;
    camp.location = geoData.features[0].place_name;
    camp.image = req.files.map(f=>({url:f.path, fileName:f.filename}));
    camp.author = req.user._id;
    await camp.save();
    console.log(camp.image);
    req.flash('success','Successfully created a new campground!');
    res.redirect(`/campgrounds/${camp._id}`);
    }

module.exports.showCamp = async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    if(!camp){
        req.flash('error','Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show",{camp});
}

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit",{camp});
}

module.exports.editCamp = async(req,res)=>{
    const {id} = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const imgs = req.files.map(f=>({url:f.path, fileName:f.filename}));
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    camp.geometry = geoData.features[0].geometry;
    camp.location = geoData.features[0].place_name;
    camp.image.push(...imgs); 
    await camp.save();
    if(req.body.deleteImages){
        for(let fileName of req.body.deleteImages){
            cloudinary.uploader.destroy(fileName);
        }
        await camp.updateOne({$pull:{image:{fileName:{$in: req.body.deleteImages}}}});
    }
    req.flash('success','Successfully updated campground!');
    res.redirect(`${camp._id}`);
}

module.exports.deleteCamp = async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id).populate('reviews');
    req.flash('success','Successfully deleted campground!');
    res.redirect("/campgrounds");
}