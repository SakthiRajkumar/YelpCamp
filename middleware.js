const User = require('./models/user');
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
    req.session.returnTo = req.originalUrl;
    if (!req.user) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};