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


const sessionConfig = {
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
app.use(helmet({contentSecurityPolicy: false}))

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