const express = require('express');
const Joi = require('joi');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    preferences: Joi.object({
        theme: Joi.string().valid('light', 'dark'),
        notifications: Joi.object({
            email: Joi.boolean(),
            campaigns: Joi.boolean()
        })
    })
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    preferences: user.preferences,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferences: user.preferences
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard stats
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
    try {
        const Campaign = require('../models/Campaign');
        const AudienceSegment = require('../models/AudienceSegment');

        // Get user's campaigns and segments
        const [campaigns, segments] = await Promise.all([
            Campaign.find({ createdBy: req.user.id }),
            AudienceSegment.find({ createdBy: req.user.id, isActive: true })
        ]);

        // Calculate stats
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => ['sending', 'scheduled'].includes(c.status)).length;
        const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;

        const totalSegments = segments.length;
        const totalAudienceSize = segments.reduce((sum, seg) => sum + seg.audienceSize, 0);

        const totalMessagesSent = campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0);
        const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0);
        const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0);

        const avgOpenRate = totalMessagesSent > 0 ? ((totalOpened / totalMessagesSent) * 100).toFixed(1) : 0;
        const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0;

        // Recent campaigns
        const recentCampaigns = campaigns
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(campaign => ({
                id: campaign._id,
                name: campaign.name,
                status: campaign.status,
                type: campaign.type,
                sent: campaign.metrics.sent,
                openRate: campaign.openRate,
                createdAt: campaign.createdAt
            }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    campaigns: {
                        total: totalCampaigns,
                        active: activeCampaigns,
                        completed: completedCampaigns
                    },
                    segments: {
                        total: totalSegments,
                        totalAudience: totalAudienceSize
                    },
                    performance: {
                        messagesSent: totalMessagesSent,
                        avgOpenRate: parseFloat(avgOpenRate),
                        avgClickRate: parseFloat(avgClickRate)
                    }
                },
                recentCampaigns
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const users = await User.findActive()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});

module.exports = router;
