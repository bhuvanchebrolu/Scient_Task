const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  res.redirect('/');
};

const isProfessor = (req, res, next) => {
  if (req.user && req.user.role === 'professor') {
    return next();
  }
  req.flash('error', 'Access denied. Professor privileges required.');
  res.redirect('/');
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  req.flash('error', 'Access denied. Student privileges required.');
  res.redirect('/');
};

const isProfessorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'professor' || req.user.role === 'admin')) {
    return next();
  }
  req.flash('error', 'Access denied. Professor or Admin privileges required.');
  res.redirect('/');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isProfessor,
  isStudent,
  isProfessorOrAdmin
};
