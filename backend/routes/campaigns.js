const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const AudienceSegment = require('../models/AudienceSegment');

const router = express.Router();

// Validation schemas
const campaignSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    type: Joi.string().valid('email', 'sms', 'push', 'social').default('email'),
    audienceSegment: Joi.string().required(),
    content: Joi.object({
        subject: Joi.string().when('$type', {
            is: 'email',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        message: Joi.string().required(),
        template: Joi.string().allow('').optional()
    }).required(),
    scheduling: Joi.object({
        sendAt: Joi.date(),
        timezone: Joi.string().default('UTC'),
        isRecurring: Joi.boolean().default(false),
        recurringPattern: Joi.string().valid('daily', 'weekly', 'monthly')
    }),
    settings: Joi.object({
        trackOpens: Joi.boolean().default(true),
        trackClicks: Joi.boolean().default(true),
        allowUnsubscribe: Joi.boolean().default(true)
    }),
    tags: Joi.array().items(Joi.string())
});

// @route   GET /api/campaigns
// @desc    Get all campaigns for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;

        // Build query
        const query = { createdBy: req.user.id };
        if (status) query.status = status;
        if (type) query.type = type;

        // Pagination
        const skip = (page - 1) * limit;

        const campaigns = await Campaign.find(query)
            .populate('audienceSegment', 'name audienceSize')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Campaign.countDocuments(query);

        res.status(200).json({
            success: true,
            count: campaigns.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: { campaigns }
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching campaigns'
        });
    }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = campaignSchema.validate(req.body, {
            context: { type: req.body.type }
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Verify audience segment exists and belongs to user
        const segment = await AudienceSegment.findOne({
            _id: req.body.audienceSegment,
            createdBy: req.user.id,
            isActive: true
        });

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Audience segment not found or inactive'
            });
        }

        // Create campaign
        const campaign = await Campaign.create({
            ...req.body,
            createdBy: req.user.id,
            'metrics.audienceSize': segment.audienceSize
        });

        // Increment segment usage
        await segment.incrementUsage();

        // Populate the response
        await campaign.populate('audienceSegment', 'name audienceSize');

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: { campaign }
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating campaign'
        });
    }
});

// @route   GET /api/campaigns/:id
// @desc    Get specific campaign
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        })
            .populate('audienceSegment', 'name audienceSize rules')
            .populate('createdBy', 'name email');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { campaign }
        });
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching campaign'
        });
    }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if campaign can be edited
        if (['sending', 'completed'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit campaign that is sending or completed'
            });
        }

        // Validate input
        const { error } = campaignSchema.validate(req.body, {
            context: { type: req.body.type || campaign.type }
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Update campaign
        Object.assign(campaign, req.body);
        await campaign.save();

        await campaign.populate('audienceSegment', 'name audienceSize');

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            data: { campaign }
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating campaign'
        });
    }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if campaign can be deleted
        if (['sending', 'completed'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete campaign that is sending or completed'
            });
        }

        await Campaign.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting campaign'
        });
    }
});

// @route   POST /api/campaigns/:id/send
// @desc    Send campaign
// @access  Private
router.post('/:id/send', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        }).populate('audienceSegment');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if campaign can be sent
        if (!['draft', 'scheduled'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Campaign cannot be sent in current status'
            });
        }

        // Send campaign (this will update metrics and status)
        await campaign.send();

        res.status(200).json({
            success: true,
            message: 'Campaign sent successfully',
            data: { campaign }
        });
    } catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending campaign'
        });
    }
});

// @route   POST /api/campaigns/:id/pause
// @desc    Pause campaign
// @access  Private
router.post('/:id/pause', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'sending') {
            return res.status(400).json({
                success: false,
                message: 'Only sending campaigns can be paused'
            });
        }

        campaign.status = 'paused';
        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Campaign paused successfully',
            data: { campaign }
        });
    } catch (error) {
        console.error('Pause campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while pausing campaign'
        });
    }
});

// @route   GET /api/campaigns/stats/overview
// @desc    Get campaign statistics overview
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user.id });

        const stats = {
            total: campaigns.length,
            byStatus: {
                draft: campaigns.filter(c => c.status === 'draft').length,
                scheduled: campaigns.filter(c => c.status === 'scheduled').length,
                sending: campaigns.filter(c => c.status === 'sending').length,
                completed: campaigns.filter(c => c.status === 'completed').length,
                failed: campaigns.filter(c => c.status === 'failed').length,
                paused: campaigns.filter(c => c.status === 'paused').length
            },
            byType: {
                email: campaigns.filter(c => c.type === 'email').length,
                sms: campaigns.filter(c => c.type === 'sms').length,
                push: campaigns.filter(c => c.type === 'push').length,
                social: campaigns.filter(c => c.type === 'social').length
            },
            metrics: {
                totalSent: campaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
                totalDelivered: campaigns.reduce((sum, c) => sum + c.metrics.delivered, 0),
                totalOpened: campaigns.reduce((sum, c) => sum + c.metrics.opened, 0),
                totalClicked: campaigns.reduce((sum, c) => sum + c.metrics.clicked, 0)
            }
        };

        // Calculate averages
        const completedCampaigns = campaigns.filter(c => c.status === 'completed');
        if (completedCampaigns.length > 0) {
            stats.averages = {
                deliveryRate: (stats.metrics.totalDelivered / stats.metrics.totalSent * 100).toFixed(1),
                openRate: (stats.metrics.totalOpened / stats.metrics.totalDelivered * 100).toFixed(1),
                clickRate: (stats.metrics.totalClicked / stats.metrics.totalOpened * 100).toFixed(1)
            };
        }

        res.status(200).json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Campaign stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching campaign statistics'
        });
    }
});

module.exports = router;
