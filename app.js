if (process.env.NODE_ENV !== "production"){
  require ('dotenv').config();
}

console.log(process.env.SECRET)

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require ('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const userRoutes = require('./routes/users.js')
const campgroundsRoutes = require("./routes/campgrounds.js");
const reviewsRoutes = require("./routes/reviews");
const mongoSanitize = require('express-mongo-sanitize');

//connect to mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use( mongoSanitize({
  replaceWith: '_',
}),);

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success=req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// /register-FORM
// Post /register = create a user
// GET / login form 

app.get('/fakeUser',async(req,res)=>{
  const user = new User({email:'test@gmail.com',username:'testtt'})
  const newUser = await User.register(user,'chicken')
  res.send(newUser)
})
app.use("/",userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);


app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong ";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
