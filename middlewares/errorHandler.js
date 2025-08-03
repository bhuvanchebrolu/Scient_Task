const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const globalErrorHandler = (error, req, res, next) => {
  console.error(error.stack);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    req.flash('error', errors.join(', '));
    return res.redirect('back');
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    req.flash('error', 'Email already exists');
    return res.redirect('back');
  }
  
  // Default error
  req.flash('error', 'Something went wrong. Please try again.');
  res.redirect('/');
};

module.exports = { asyncErrorHandler, globalErrorHandler };