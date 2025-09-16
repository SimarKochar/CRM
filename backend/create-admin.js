const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/crm-database');
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingUser = await User.findOne({ email: 'demo@example.com' });
        if (existingUser) {
            console.log('User already exists, deleting...');
            await User.deleteOne({ email: 'demo@example.com' });
        }

        // Create admin user (let the model hash the password)
        const adminUser = new User({
            name: 'Demo Admin',
            email: 'demo@example.com',
            password: 'demo123', // Don't hash manually - let the model do it
            role: 'admin',
            isEmailVerified: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: demo@example.com');
        console.log('Password: demo123');
        console.log('Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();