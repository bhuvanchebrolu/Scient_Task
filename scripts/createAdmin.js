const mongoose = require('mongoose');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect('mongodb+srv://delta-student:Sairam123@cluster0.oao497x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin'
    });
    
    await admin.save();
    console.log('Default admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDefaultAdmin();