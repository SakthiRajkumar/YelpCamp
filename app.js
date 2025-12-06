const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const {campgroundSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
//Connect to mongoose
//mongoose.connect('mongodb://localhost:27017/yelp-camp');

require('dotenv').config();
console.log("URI for env",process.env.MONGODB_URI);
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yelp-camp';
//const mongoURI = 'mongodb+srv://sakthir1610:December%402025YelpCamp@yelpcamp-cluster.t5twpd9.mongodb.net/yelp-camp?appName=yelpcamp-cluster';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DataBase Connected!");
});

const app = express();

const validateCampground = (req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}

//View engine Setup
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//Routes

app.get("/",(req,res)=>{
    res.redirect("/campgrounds");
});

app.post("/campgrounds",validateCampground, catchAsync(async(req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError(400, "Invalid CampGround Data");
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
    }));

app.get("/campgrounds",catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
}));

app.get("/run-seed",catchAsync(async(req,res)=>{
    if(req.query.key!=='Pwd1234'){
        return res.status(403).send('Unauthorized');
    }
    await require('./seeds/index.js');
    res.redirect("/campgrounds");
}));


app.get("/campgrounds/new",(req,res)=>{
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id",catchAsync(async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/show",{camp});
}));

app.get("/campgrounds/:id/edit",catchAsync(async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit",{camp});
}));

app.delete("/campgrounds/:id",catchAsync(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.put("/campgrounds/:id",validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`${camp._id}`);
}));

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    const {status=500,message="Something Went Wrong!"} = err;
    if(!err.message) err.message = "Something Went Wrong";
    if(!err.status) err.status = 500;
    res.status(status).render("error",{err});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})