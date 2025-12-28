if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config({quiet : true});
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const { checkUser, requireAuth } = require('./middleware');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo') (session);

const ejsMate = require("ejs-mate");

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { contentSecurityPolicy } = require('helmet');

//Connect to mongoose
//mongoose.connect('mongodb://localhost:27017/yelp-camp');


//console.log("URI for env",process.env.MONGODB_URI);
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yelp-camp';
//const mongoURI = 'mongodb+srv://sakthir1610:December%402025YelpCamp@yelpcamp-cluster.t5twpd9.mongodb.net/yelp-camp?appName=yelpcamp-cluster';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DataBase Connected!");
});

const app = express();
app.set('query parser', 'extended');


//View engine Setup
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")));
app.use(sanitizeV5({ replaceWith: '_' }));

const store = new MongoDBStore({
    url : process.env.MONGODB_URI,
    secret : 'thisshouldbeabettersecret',
    touchAfter : 24 * 60 * 60 
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store, 
    name : 'sessh',
    secret : 'thisshouldbeabettersecret',
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge : 1000 * 60 * 60 * 24 * 7 ,
        httpOnly : true,
        //secure: true
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(checkUser);
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];

app.use(helmet.contentSecurityPolicy({
    directives:{
        defaultSrc: [],
        connectSrc : ["'self'",...connectSrcUrls],
        scriptSrc : ["'unsafe-inline'","'self'", ...scriptSrcUrls],
        styleSrc : ["'self'","'unsafe-inline'", ...styleSrcUrls],
        workerSrc: [
    "'self'", 
    "blob:", 
    "https://api.maptiler.com",
],
        objectSrc : [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dqhmyteav/",
            "https://api.maptiler.com/",
            "https://images.unsplash.com/"
        ],
        fontSrc :["'self'",...fontSrcUrls],
},
})
);

//Middleware
app.use(async (req,res,next)=>{
    res.locals.success = req.flash('success'); 
    res.locals.error = req.flash('error'); 
    next();
});


//Routes

app.use("/",userRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);

app.get("/run-seed",catchAsync(async(req,res)=>{
    if(req.query.key!=='Pwd1234'){
        return res.status(403).send('Unauthorized');
    }
    await require('./seeds/index.js');
    res.redirect("/campgrounds");
}));

app.get("/",(req,res)=>{
    res.render('campgrounds/home');
});

//Error Handling

app.all(/.*/, (req, res, next) => {
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