const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testLogin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/crm-database');
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'demo@example.com' }).select('+password');
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.email);
        console.log('User role:', user.role);
        console.log('User active:', user.isActive);
        console.log('Stored password hash:', user.password);

        // Test password
        const testPassword = 'demo123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('Password match:', isMatch);

        // Also test the model method
        if (user.matchPassword) {
            const modelMatch = await user.matchPassword(testPassword);
            console.log('Model method match:', modelMatch);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();