const mongoose = require('mongoose');

const audienceSegmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Segment name is required'],
        trim: true,
        maxlength: [100, 'Segment name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Segment description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    rules: [{
        field: {
            type: String,
            required: true,
            enum: [
                'totalSpent',
                'orderCount',
                'lastPurchase',
                'lastLogin',
                'visits',
                'age',
                'location',
                'signupDate',
                'customerLifetimeValue'
            ]
        },
        operator: {
            type: String,
            required: true,
            enum: ['>', '<', '>=', '<=', '=', '!=', 'contains', 'in', 'not_in']
        },
        value: {
            type: String,
            required: true
        },
        logic: {
            type: String,
            enum: ['AND', 'OR'],
            required: false
        }
    }],
    audienceSize: {
        type: Number,
        default: 0,
        min: 0
    },
    estimatedReach: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
audienceSegmentSchema.index({ createdBy: 1, createdAt: -1 });
audienceSegmentSchema.index({ name: 1, createdBy: 1 });
audienceSegmentSchema.index({ tags: 1 });
audienceSegmentSchema.index({ isActive: 1 });

// Virtual for campaigns using this segment
audienceSegmentSchema.virtual('campaigns', {
    ref: 'Campaign',
    localField: '_id',
    foreignField: 'audienceSegment'
});

// Pre-save middleware to update lastUpdated
audienceSegmentSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdated = new Date();
    }
    next();
});

// Instance method to calculate audience size
audienceSegmentSchema.methods.calculateAudienceSize = async function () {
    // This would typically query your customer database based on rules
    // For now, we'll simulate with a random calculation
    const baseSize = Math.floor(Math.random() * 5000) + 100;
    this.audienceSize = baseSize;
    this.estimatedReach = Math.floor(baseSize * 0.85); // 85% deliverability estimate
    return this.save();
};

// Instance method to increment usage
audienceSegmentSchema.methods.incrementUsage = function () {
    this.usageCount += 1;
    return this.save({ validateBeforeSave: false });
};

// Static method to find popular segments
audienceSegmentSchema.statics.findPopular = function (limit = 10) {
    return this.find({ isActive: true })
        .sort({ usageCount: -1 })
        .limit(limit)
        .populate('createdBy', 'name email');
};

// Static method to find segments by user
audienceSegmentSchema.statics.findByUser = function (userId) {
    return this.find({ createdBy: userId, isActive: true })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');
};

module.exports = mongoose.model('AudienceSegment', audienceSegmentSchema);
