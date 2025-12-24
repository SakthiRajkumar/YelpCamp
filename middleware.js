const User = require('./models/user');
const Review = require('./models/review');
const Campground = require('./models/campground');
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');

module.exports.checkUser = async (req, res, next) => {    
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            res.locals.currentUser = user;
            req.user = user;
        } catch (err) {
            res.locals.currentUser = null;
            req.user = null;
        }
    } else {
        res.locals.currentUser = null;
        req.user = null;
    }
    next(); 
};
module.exports.requireAuth = (req, res, next) => {
    if (req.originalUrl.includes('/reviews/') && req.originalUrl.includes('?_method=DELETE')) {
            const parts = req.originalUrl.split('/');
            // parts[2] should be the campground ID
            const campgroundId = parts[2];
            req.session.returnTo = `/campgrounds/${campgroundId}`;
    } else {
            req.session.returnTo = req.originalUrl;
    }
    if (!req.user) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateCampground = (req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
};

module.exports.isAuthor = async (req,res,next)=>{
     const {id} = req.params;
     const campground = await Campground.findById(id);
     if(!campground.author.equals(req.user._id)){
        req.flash('error','Permission denied!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req,res,next)=>{
     const {id,reviewId} = req.params;
     const review = await Review.findById(reviewId);
     if(!review.author.equals(req.user._id)){
        req.flash('error','Permission denied!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}