"# Scient_Task" 
Key Features Implemented:
Authentication & Authorization

 Separate authentication for Students, Professors, and Admin using Passport.js
 Role-based access control with middleware
 Default admin user (admin@example.com / admin123)
 Session management and flash messages

Professor Capabilities

 Create, edit, delete their own projects
 Add/remove students to/from their projects
 View and manage student assignments
 Dashboard with project overview

Student Capabilities

 View all projects from all professors
 See which projects they're assigned to
  Read-only access to project details

Admin Capabilities

 Full CRUD operations on users and projects
 Add students to any project
 System-wide statistics dashboard
 User management interface

 Technical Architecture:
MVC Structure

Models: User and Project schemas with Mongoose
Views: EJS templates with Bootstrap 5 styling
Controllers: Organized route handlers in separate files
Config: Database and Passport configuration
Middlewares: Authentication, authorization, and error handling

Security & Validation

 Password hashing with bcryptjs
 Custom async error handlers
 Bootstrap form validation
 Express-validator for server-side validation
 Method override for RESTful routes

Database Design

User Model: Supports different roles with role-specific fields
Project Model: Links professors and students with proper relationships

 Getting Started:

Install dependencies: npm install
Set up MongoDB and update connection string in .env
Create default admin: node scripts/createAdmin.js
Start the server: npm start
Access: http://localhost:3000

 Default Login:

Admin: admin@example.com / admin123
Students/Professors: Register through the interface

The system includes comprehensive error handling, flash messages, responsive Bootstrap UI, and follows REST conventions. All routes are properly protected with authentication and authorization middleware.
