const express = require('express');
const app = express();
const path = require('path');
const nocache = require('nocache');
const session = require("express-session");
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('passport');
const passportSetup = require('./config/passport-setup');

const connectionString = 'mongodb+srv://ananda1732001:uPBedqTmVgEPBs9w@cluster0.vdv0lyi.mongodb.net/';
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log('Database connection error:', err));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// test
app.use(nocache());
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoute = require('./routes/userroute');
app.use('/', userRoute);
const adminRoute = require('./routes/adminroute');
app.use('/admin', adminRoute);
const authRoutes = require('./routes/auth-route');
app.use('/auth', authRoutes);

// Middleware to handle undefined routes
// app.use((req, res, next) => {
//   const error = new Error("Not Found");
//   error.status = 404;
//   next(error);
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   let url = "";
//   let folder = "";
//   req.url.split("/")[1] === "admin" ? (folder = "admin") : (folder = "user");
//   req.url.split("/")[1] === "admin" ? (url = "/admin/dashboard") : (url = "/loginedhome");
//   res.status(err.status || 500);
//   res.render("pagenotfound", { error: err, url: url, folder: folder, layout: false }); // Pass layout: false to prevent EJS from trying to apply a layout
// });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is started on port ${port}`);
});