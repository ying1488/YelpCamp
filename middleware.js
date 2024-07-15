const { campgroundSchema,reviewSchema } = require('./schemas.js');
const ExpressError  = require ('./utils/ExpressError.js');
const Campground = require('./models/campgrounds.js');

module.exports.isLoggedIn = (req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.returnTo = req.originalUrl;
    req.flash('error','you must be signed in');
    return res.redirect('/login');
  }
  next();
};

module.exports.validateCampground =  (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
};

module.exports.isAuthor = async(req,res,next)=>{
  const{id} = req.params;
  const campground = await Campground.findById(id);
  if(! campground.author.equals(req.user._id)){
      req.flash('error','you do not have permission to do that !');
      return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
  }
  next();
};