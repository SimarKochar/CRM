const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    profilePicture: {
        type: String
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            campaigns: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's campaigns
userSchema.virtual('campaigns', {
    ref: 'Campaign',
    localField: '_id',
    foreignField: 'createdBy'
});

// Virtual for user's audience segments
userSchema.virtual('audienceSegments', {
    ref: 'AudienceSegment',
    localField: '_id',
    foreignField: 'createdBy'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's been modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
