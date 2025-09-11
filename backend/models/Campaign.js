const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true,
        maxlength: [100, 'Campaign name cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['email', 'sms', 'push', 'social'],
        default: 'email'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'completed', 'failed', 'paused'],
        default: 'draft'
    },
    audienceSegment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AudienceSegment',
        required: true
    },
    content: {
        subject: {
            type: String,
            required: function () { return this.type === 'email'; }
        },
        message: {
            type: String,
            required: true
        },
        template: {
            type: String
        },
        attachments: [{
            filename: String,
            url: String,
            size: Number
        }]
    },
    scheduling: {
        sendAt: {
            type: Date
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringPattern: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: function () { return this.scheduling.isRecurring; }
        }
    },
    metrics: {
        audienceSize: {
            type: Number,
            default: 0
        },
        sent: {
            type: Number,
            default: 0
        },
        delivered: {
            type: Number,
            default: 0
        },
        failed: {
            type: Number,
            default: 0
        },
        opened: {
            type: Number,
            default: 0
        },
        clicked: {
            type: Number,
            default: 0
        },
        unsubscribed: {
            type: Number,
            default: 0
        },
        bounced: {
            type: Number,
            default: 0
        }
    },
    settings: {
        trackOpens: {
            type: Boolean,
            default: true
        },
        trackClicks: {
            type: Boolean,
            default: true
        },
        allowUnsubscribe: {
            type: Boolean,
            default: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sentAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
campaignSchema.index({ createdBy: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ 'scheduling.sendAt': 1 });
campaignSchema.index({ audienceSegment: 1 });

// Virtual for delivery rate
campaignSchema.virtual('deliveryRate').get(function () {
    if (this.metrics.sent === 0) return 0;
    return ((this.metrics.delivered / this.metrics.sent) * 100).toFixed(1);
});

// Virtual for open rate
campaignSchema.virtual('openRate').get(function () {
    if (this.metrics.delivered === 0) return 0;
    return ((this.metrics.opened / this.metrics.delivered) * 100).toFixed(1);
});

// Virtual for click rate
campaignSchema.virtual('clickRate').get(function () {
    if (this.metrics.opened === 0) return 0;
    return ((this.metrics.clicked / this.metrics.opened) * 100).toFixed(1);
});

// Pre-save middleware to update completion status
campaignSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }

    if (this.status === 'sending' && !this.sentAt) {
        this.sentAt = new Date();
    }

    next();
});

// Instance method to update metrics
campaignSchema.methods.updateMetrics = function (newMetrics) {
    Object.assign(this.metrics, newMetrics);
    return this.save();
};

// Instance method to send campaign
campaignSchema.methods.send = async function () {
    this.status = 'sending';
    this.sentAt = new Date();

    // Simulate sending process
    // In real implementation, this would integrate with email/SMS services
    const audienceSize = this.metrics.audienceSize || 1000;

    // Simulate realistic metrics
    const sent = audienceSize;
    const deliveryRate = 0.85 + (Math.random() * 0.1); // 85-95%
    const delivered = Math.floor(sent * deliveryRate);
    const failed = sent - delivered;

    const openRate = 0.15 + (Math.random() * 0.25); // 15-40%
    const opened = Math.floor(delivered * openRate);

    const clickRate = 0.02 + (Math.random() * 0.08); // 2-10%
    const clicked = Math.floor(opened * clickRate);

    this.metrics = {
        audienceSize,
        sent,
        delivered,
        failed,
        opened,
        clicked,
        unsubscribed: Math.floor(opened * 0.001), // 0.1%
        bounced: Math.floor(sent * 0.02) // 2%
    };

    this.status = 'completed';
    this.completedAt = new Date();

    return this.save();
};

// Static method to find campaigns by status
campaignSchema.statics.findByStatus = function (status) {
    return this.find({ status })
        .populate('audienceSegment', 'name audienceSize')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
};

// Static method to find scheduled campaigns
campaignSchema.statics.findScheduled = function () {
    return this.find({
        status: 'scheduled',
        'scheduling.sendAt': { $lte: new Date() }
    }).populate('audienceSegment createdBy');
};

module.exports = mongoose.model('Campaign', campaignSchema);
