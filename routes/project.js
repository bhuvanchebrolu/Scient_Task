const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { isAuthenticated, isStudent } = require('../middlewares/auth');
const { asyncErrorHandler } = require('../middlewares/errorHandler');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// View project details (accessible to all authenticated users)
router.get('/:id', asyncErrorHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('professor', 'name email department employeeId')
    .populate('students', 'name email studentId department');
  
  if (!project) {
    req.flash('error', 'Project not found');
    return res.redirect('/');
  }
  
  res.render('projects/details', {
    title: project.title,
    project,
    user: req.user,
    request: req
  });
}));

// Leave project (students only)
router.post('/:id/leave', isStudent, asyncErrorHandler(async (req, res) => {
  const projectId = req.params.id;
  const studentId = req.user._id;

  const project = await Project.findById(projectId);
  
  if (!project) {
    return res.json({ success: false, message: 'Project not found' });
  }

  // Remove student from project
  project.students = project.students.filter(
    student => student.toString() !== studentId.toString()
  );
  
  await project.save();
  
  req.flash('success', 'You have left the project successfully');
  res.json({ success: true, message: 'Left project successfully' });
}));

module.exports = router;