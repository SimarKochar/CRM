const express = require('express');
const Joi = require('joi');
const { auth, authorize } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const AudienceSegment = require('../models/AudienceSegment');
const User = require('../models/User');

const router = express.Router();

// Validation schemas
const campaignSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('email', 'sms', 'push', 'social').default('email'),
    audienceSegment: Joi.string().required(),
    content: Joi.object({
        subject: Joi.string().optional(),
        message: Joi.string().required()
    }).required()
});

// @route   GET /api/campaigns
// @desc    Get all campaigns for user (ADMIN ONLY)
// @access  Private
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user.id })
            .populate('audienceSegment', 'name audienceSize')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
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
// @desc    Create new campaign (ADMIN ONLY)
// @access  Private
router.post('/', auth, authorize('admin'), async (req, res) => {
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

        // Start campaign delivery process (async)
        initiateCampaignDelivery(campaign._id, segment, req.body.content, req.user.id);

        res.status(201).json({
            success: true,
            message: 'Campaign created and delivery initiated',
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
// @route   PUT /api/campaigns/:id
// @desc    Update campaign (ADMIN ONLY)
// @access  Private
router.put('/:id', auth, authorize('admin'), async (req, res) => {
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
// @desc    Delete campaign (ADMIN ONLY)
// @access  Private
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
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
// @desc    Send campaign (ADMIN ONLY)
// @access  Private
router.post('/:id/send', auth, authorize('admin'), async (req, res) => {
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

        // Send campaign (this will create communication logs and update metrics)
        await initiateCampaignDelivery(
            campaign._id,
            campaign.audienceSegment,
            campaign.content,
            req.user.id
        );

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
// @route   POST /api/campaigns/:id/reset
// @desc    Reset campaign to draft status (ADMIN ONLY)
// @access  Private
router.post('/:id/reset', auth, authorize('admin'), async (req, res) => {
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

        // Allow resetting from any status (especially stuck sending status)
        campaign.status = 'draft';
        campaign.sentAt = null;
        campaign.completedAt = null;

        // Clear metrics if any
        if (campaign.metrics) {
            campaign.metrics = undefined;
        }

        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Campaign reset to draft successfully',
            data: { campaign }
        });
    } catch (error) {
        console.error('Reset campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting campaign'
        });
    }
});

// @route   GET /api/campaigns/stats/overview
// @desc    Get campaign statistics overview
// @access  Private
// Simplified campaign delivery function
async function initiateCampaignDelivery(campaignId, segment, content, userId) {
    try {
        console.log(`📤 Starting campaign delivery for campaign: ${campaignId}`);

        // Update campaign status to sending
        await Campaign.findByIdAndUpdate(campaignId, { status: 'sending' });

        // Get target customers from the segment
        const targetCustomers = segment.customers || [];
        console.log(`👥 Target audience: ${targetCustomers.length} customers`);

        // Simulate processing delay (2 seconds)
        setTimeout(async () => {
            try {
                await Campaign.findByIdAndUpdate(campaignId, {
                    status: 'completed',
                    sentAt: new Date(),
                    metrics: {
                        sent: targetCustomers.length,
                        failed: 0,
                        audienceSize: targetCustomers.length
                    }
                });
                console.log(`✅ Campaign ${campaignId} marked as completed`);
            } catch (error) {
                console.error('Error updating campaign status:', error);
            }
        }, 2000);

    } catch (error) {
        console.error('Campaign delivery error:', error);

        // Mark campaign as failed
        try {
            await Campaign.findByIdAndUpdate(campaignId, {
                status: 'failed',
                errorMessage: error.message
            });
        } catch (updateError) {
            console.error('Error updating failed campaign status:', updateError);
        }
    }
}

module.exports = router;
