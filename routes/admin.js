const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Project = require('../models/Project');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { asyncErrorHandler } = require('../middlewares/errorHandler');
const router = express.Router();

// Apply authentication middleware to all routes--check if logged in and is admin
router.use(isAuthenticated, isAdmin);

// Dashboard Route
router.get('/dashboard', asyncErrorHandler(async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    totalProfessors: await User.countDocuments({ role: 'professor' }),
    totalStudents: await User.countDocuments({ role: 'student' }),
    totalProjects: await Project.countDocuments(),
    activeProjects: await Project.countDocuments({ status: 'active' })
  };
  
  const recentProjects = await Project.find()
    .populate('professor', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.render('admin/dashboard', { 
    title: 'Admin Dashboard',
    stats,
    recentProjects,
    user: req.user
  });
}));

// Handle users-> students and proff
router.get('/users', asyncErrorHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Manage Users', users });
}));

// Create user form
router.get('/users/new', (req, res) => {
  res.render('admin/create-user', { title: 'Create New User' });
});

//Add users
router.post('/users', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'professor']).withMessage('Invalid role selected')
], asyncErrorHandler(async (req, res) => {
  const errors = validationResult(req);
  //ways to handle error message
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/admin/users/new');
  }

  const userData = { ...req.body };
  const user = new User(userData);
  await user.save();
  
  req.flash('success', 'User created successfully!');
  res.redirect('/admin/users');
}));

// Delete user
router.delete('/users/:id', asyncErrorHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash('success', 'User deleted successfully!');
  res.redirect('/admin/users');
}));

// Project management
router.get('/projects', asyncErrorHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('professor', 'name email')
    .populate('students', 'name email')
    .sort({ createdAt: -1 });
  
  // Get all students for the dropdown--> find all students select their name and email and sore 
  const allStudents = await User.find({ role: 'student' }).select('name email').sort({ name: 1 });
  
  res.render('admin/projects', { 
    title: 'Manage Projects', 
    projects,
    allStudents 
  });
}));

// Add student to project
router.post('/projects/:id/students', asyncErrorHandler(async (req, res) => {
  const { studentId } = req.body;
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/admin/projects');
  }
  
  if (!project.students.includes(studentId)) {
    project.students.push(studentId);
    await project.save();
    req.flash('success', 'Student added to project successfully!');
  } else {
    req.flash('error', 'Student is already part of this project');
  }
  
  res.redirect('/admin/projects');
}));

// Remove student from project--view incmplete route present
router.delete('/projects/:id/students/:studentId', asyncErrorHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/admin/projects');
  }
  
  project.students = project.students.filter(
    student => student.toString() !== req.params.studentId
  );
  await project.save();
  
  req.flash('success', 'Student removed from project successfully!');
  res.redirect('/admin/projects');
}));

module.exports = router;