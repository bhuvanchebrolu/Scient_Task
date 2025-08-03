require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore=require("connect-mongo");
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Import configurations-Step1
require('./config/passport');
const { connectDB } = require('./config/database');
const { asyncErrorHandler, globalErrorHandler } = require('./middlewares/errorHandler');

// Import routes-Step2
const authRoutes = require('./routes/auth');
const professorRoutes = require('./routes/professor.js');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const projectRoutes = require('./routes/project');

// Connect to database-Step3
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const store=MongoStore.create({
    mongoUrl:process.env.MONGODB_URI,
    crypto:{
        secret:process.env.SESSION_SECRET,
    },
    touchAfter:24*3600
});
store.on("error",()=>{
    console.log("Error in mongo session store",err);
})
// Session configuration
app.use(session({
  store,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Middle ware for flash messages and current user
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/professor', professorRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/projects', projectRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Academic Project System' });
});

// Error handling
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});