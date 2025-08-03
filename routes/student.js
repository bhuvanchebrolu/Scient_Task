const express = require('express');
const Project = require('../models/Project');
const { isAuthenticated, isStudent } = require('../middlewares/auth');
const { asyncErrorHandler } = require('../middlewares/errorHandler');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated, isStudent);

// Dashboard
router.get('/dashboard', asyncErrorHandler(async (req, res) => {
  const myProjects = await Project.find({ students: req.user._id })
    .populate('professor', 'name email department')
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  const allProjects = await Project.find()
    .populate('professor', 'name email department')
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.render('student/dashboard', { 
    title: 'Student Dashboard',
    myProjects,
    allProjects: allProjects.slice(0, 5), // Show only 5 recent projects
    user: req.user
  });
}));

// View all projects
router.get('/projects', asyncErrorHandler(async (req, res) => {
  const allProjects = await Project.find()
    .populate('professor', 'name email department')
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.render('student/projects', { title: 'All Projects', projects: allProjects });
}));

// View my projects
router.get('/my-projects', asyncErrorHandler(async (req, res) => {
  const myProjects = await Project.find({ students: req.user._id })
    .populate('professor', 'name email department')
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.render('student/my-projects', { title: 'My Projects', projects: myProjects });
}));

// View project details
router.get('/projects/:id', asyncErrorHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('professor', 'name email department employeeId')
    .populate('students', 'name email studentId department');
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/student/projects');
  }
  
  res.render('student/project-details', { title: project.title, project });
}));

module.exports = router;
