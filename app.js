const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require("./models/campground");
//Connect to mongoose
//mongoose.connect('mongodb://localhost:27017/yelp-camp');

require('dotenv').config();
console.log("URI for env",process.env.MONGODB_URI);
//const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yelp-camp';
const mongoURI = 'mongodb+srv://sakthir1610:December@2025YelpCamp@yelpcamp-cluster.t5twpd9.mongodb.net/yelp-camp?appName=yelpcamp-cluster';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DataBase Connected!");
});

const app = express();

//View engine Setup
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//Routes
app.post("/campgrounds", async(req,res)=>{
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
});

app.get("/campgrounds",async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
});


app.get("/campgrounds/new",(req,res)=>{
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id",async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/show",{camp});
});

app.get("/campgrounds/:id/edit",async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit",{camp});
});

app.delete("/campgrounds/:id",async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})

app.put("/campgrounds/:id",async(req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`${camp._id}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})