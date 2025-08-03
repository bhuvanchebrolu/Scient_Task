const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { isAuthenticated, isProfessor } = require('../middlewares/auth');
const { asyncErrorHandler } = require('../middlewares/errorHandler');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated, isProfessor);

// Dashboard--Professor based
router.get('/dashboard', asyncErrorHandler(async (req, res) => {
  const projects = await Project.find({ professor: req.user._id })
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.render('professor/dashboard', { 
    title: 'Professor Dashboard',
    projects,
    user: req.user
  });
}));

// View all projects
router.get('/projects', asyncErrorHandler(async (req, res) => {
  const projects = await Project.find({ professor: req.user._id })
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.render('professor/projects', { title: 'My Projects', projects });
}));

// Create project form
router.get('/projects/new', (req, res) => {
  res.render('professor/create-project', { title: 'Create New Project' });
});

// Create project POST
router.post('/projects', [
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').notEmpty().withMessage('Project description is required'),
  body('department').notEmpty().withMessage('Department is required')
], asyncErrorHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/professor/projects/new');
  }

  const projectData = {
    ...req.body,
    professor: req.user._id,
    technologies: req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : []
  };

  const project = new Project(projectData);
  await project.save();
  
  req.flash('success', 'Project created successfully!');
  res.redirect('/professor/projects');
}));

// Edit project form 
router.get('/projects/:id/edit', asyncErrorHandler(async (req, res) => {
  const project = await Project.findOne({ 
    _id: req.params.id, 
    professor: req.user._id 
  }).populate('students', 'name email studentId');
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/professor/projects');
  }
  
  // Get available students (not already in this project)
  const availableStudents = await User.find({
    role: 'student',
    _id: { $nin: project.students.map(s => s._id) }
  }).select('name email studentId').sort({ name: 1 });
  
  res.render('professor/edit-project', { 
    title: 'Edit Project', 
    project,
    availableStudents 
  });
}));

// Update project
router.put('/projects/:id', [
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').notEmpty().withMessage('Project description is required')
], asyncErrorHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect(`/professor/projects/${req.params.id}/edit`);
  }

  const updateData = {
    ...req.body,
    technologies: req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : []
  };

  await Project.findOneAndUpdate(
    { _id: req.params.id, professor: req.user._id },
    updateData
  );
  
  req.flash('success', 'Project updated successfully!');
  res.redirect('/professor/projects');
}));

// Delete project
router.delete('/projects/:id', asyncErrorHandler(async (req, res) => {
  await Project.findOneAndDelete({ 
    _id: req.params.id, 
    professor: req.user._id 
  });
  
  req.flash('success', 'Project deleted successfully!');
  res.redirect('/professor/projects');
}));

// Student management
router.get('/students', asyncErrorHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ name: 1 });
  res.render('professor/students', { title: 'Manage Students', students });
}));

// Add student to project
router.post('/projects/:id/students', asyncErrorHandler(async (req, res) => {
  const { studentId } = req.body;
  const project = await Project.findOne({ 
    _id: req.params.id, 
    professor: req.user._id 
  });
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/professor/projects');
  }
  
  if (!project.students.includes(studentId)) {
    project.students.push(studentId);
    await project.save();
    req.flash('success', 'Student added to project successfully!');
  } else {
    req.flash('error', 'Student is already part of this project');
  }
  
  res.redirect(`/professor/projects/${req.params.id}/edit`);
}));

// Remove student from project
router.delete('/projects/:id/students/:studentId', asyncErrorHandler(async (req, res) => {
  const project = await Project.findOne({ 
    _id: req.params.id, 
    professor: req.user._id 
  });
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/professor/projects');
  }
  
  project.students = project.students.filter(
    student => student.toString() !== req.params.studentId
  );
  await project.save();
  
  req.flash('success', 'Student removed from project successfully!');
  res.redirect(`/professor/projects/${req.params.id}/edit`);
}));

module.exports = router;