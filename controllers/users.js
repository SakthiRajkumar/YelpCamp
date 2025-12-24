const User = require("../models/user");

module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register');
}

module.exports.registerUser = async (req,res)=>{
    try{
    const {username, email,password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser){
        throw new ExpressError(400,'A user with the given username is already reistered');
    }
    const user = new User({username,email,password});
    await user.save();
    req.session.userId = user._id;
    req.flash('success','Welcome to Yelp Camp!');
    res.redirect('/campgrounds');
    }catch(e){
        req.flash('error',e.message);
        res.redirect("/register"); 
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render('users/login');
 }

 module.exports.userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findAndValidate(username, password);
        if (user) {
            req.session.userId = user._id.toString();                       
            req.session.save((err) => {
                if (err) {
                    return res.redirect('/login');
                }
                req.flash('success', 'Welcome back!');
                const redirectUrl = req.session.returnTo || '/campgrounds';
                delete req.session.returnTo;
                res.redirect(redirectUrl);
            });
        } else {
            req.flash('error', 'Invalid username or password. Try again!');
            res.redirect('/login');
        }
    } catch (error) {
        console.log('Login error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/login');
    }
}

module.exports.userLogout = (req,res)=>{
    req.session.userId = null;
    delete req.session.returnTo;
    req.flash('success','Goodbye!');
    res.redirect('/campgrounds');
}