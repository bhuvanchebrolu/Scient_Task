const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.js');
const { asyncErrorHandler } = require('../middlewares/errorHandler');
const router = express.Router();

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// Register POST
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'professor']).withMessage('Invalid role selected')
], asyncErrorHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/auth/register');
  }

  const { name, email, password, role, department, studentId, employeeId } = req.body;
  
  const userData = { name, email, password, role };
  if (role === 'student') {
    userData.department = department;
    userData.studentId = studentId;
  } else if (role === 'professor') {
    userData.department = department;
    userData.employeeId = employeeId;
  }

  const user = new User(userData);
  await user.save();
  
  req.flash('success', 'Registration successful! Please log in.');
  res.redirect('/auth/login');
}));

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// Login POST
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/auth/login',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  
  // Redirect based on user role
  const dashboardRoutes = {
    admin: '/admin/dashboard',
    professor: '/professor/dashboard',
    student: '/student/dashboard'
  };
  
  const redirectUrl = req.session.returnTo || dashboardRoutes[req.user.role] || '/';
  delete req.session.returnTo;//deltion to ensure next time it will not redirect to same page
  res.redirect(redirectUrl);
});

// Dashboard - redirect to role-based dashboard
router.get('/dashboard', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  
  const dashboardRoutes = {
    admin: '/admin/dashboard',
    professor: '/professor/dashboard',
    student: '/student/dashboard'
  };
  
  res.redirect(dashboardRoutes[req.user.role] || '/');
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash('error', 'Error logging out');
      return res.redirect('/');
    }
    req.flash('success', 'Successfully logged out');
    res.redirect('/');
  });
});

module.exports = router;