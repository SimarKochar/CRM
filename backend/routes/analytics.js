const express = require('express');
const { auth } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const AudienceSegment = require('../models/AudienceSegment');

const router = express.Router();

// @route   POST /api/analytics/simulate-delivery
// @desc    Simulate realistic delivery data for demo purposes
// @access  Public (temporary)
router.post('/simulate-delivery', async (req, res) => {
    try {
        // Update the campaign with realistic pending status (no real email service)
        await Campaign.findByIdAndUpdate("68c304305148a924ed88be26", {
            $set: {
                'metrics.sent': 150,
                'metrics.delivered': 0,  // No real email service, so nothing delivered yet
                'metrics.failed': 5,     // Some basic failures
                'metrics.opened': 0,     // Can't track opens without delivery
                'metrics.clicked': 0,    // Can't track clicks without delivery
                'status': 'sending'      // More realistic status for pending delivery
            }
        });

        res.json({ success: true, message: "Demo data updated to pending status" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/analytics/debug
// @desc    Debug endpoint to check all data (no user filter)
// @access  Public (temporary)
router.get('/debug', async (req, res) => {
    try {
        // Get delivery statistics from campaign metrics (no user filter)
        const deliveryStats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: "$metrics.sent" },
                    totalDelivered: { $sum: "$metrics.delivered" },
                    totalFailed: { $sum: "$metrics.failed" },
                    totalOpened: { $sum: "$metrics.opened" },
                    totalClicked: { $sum: "$metrics.clicked" }
                }
            }
        ]);

        // Get campaign types (no user filter)
        const campaignTypes = await Campaign.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                }
            }
        ]);

        // Get all campaigns
        const allCampaigns = await Campaign.find().select('name status type metrics createdBy createdAt').lean();

        res.json({
            success: true,
            data: {
                deliveryStats,
                campaignTypes,
                allCampaigns,
                totalCampaigns: allCampaigns.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Debug dashboard data without auth for testing
// @access  Public (for debugging)
router.get('/dashboard-debug', async (req, res) => {
    try {
        // Get all campaigns without user filter
        const allCampaigns = await Campaign.find().lean();
        console.log("All campaigns:", allCampaigns.length);
        
        // Get delivery statistics from ALL campaigns
        const deliveryStats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: "$metrics.sent" },
                    totalDelivered: { $sum: "$metrics.delivered" },
                    totalFailed: { $sum: "$metrics.failed" },
                    totalOpened: { $sum: "$metrics.opened" },
                    totalClicked: { $sum: "$metrics.clicked" }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                allCampaigns: allCampaigns,
                deliveryStats: deliveryStats,
                totalCampaigns: deliveryStats[0] || { totalSent: 0, totalDelivered: 0, totalFailed: 0 }
            }
        });
    } catch (error) {
        console.error("Dashboard debug error:", error);
        res.status(500).json({ error: error.message });
    }
});

// @desc    Test endpoint to check data existence (no auth required)
// @access  Public
router.get('/test', async (req, res) => {
    try {
        const campaignCount = await Campaign.countDocuments();
        const userCount = await User.countDocuments();
        const segmentCount = await AudienceSegment.countDocuments();
        
        const sampleCampaign = await Campaign.findOne().lean();
        
        res.json({
            success: true,
            data: {
                campaignCount,
                userCount,
                segmentCount,
                sampleCampaign
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("Analytics Dashboard - Current User ID:", userId);

        // Debug: Check if user has any campaigns
        const userCampaigns = await Campaign.find({ createdBy: userId }).lean();
        console.log("User campaigns found:", userCampaigns.length);
        
        if (userCampaigns.length === 0) {
            console.log("No campaigns found for user. Checking all campaigns...");
            const allCampaigns = await Campaign.find().select('createdBy name').lean();
            console.log("All campaigns in DB:", allCampaigns);
        }

        // Get campaign performance over time (last 30 days) - SHOW ALL CAMPAIGNS FOR DEMO
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const campaignPerformance = await Campaign.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } }, // Removed user filter for demo
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Get delivery statistics from campaign metrics
        const deliveryStats = await Campaign.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: "$metrics.sent" },
                    totalDelivered: { $sum: "$metrics.delivered" },
                    totalFailed: { $sum: "$metrics.failed" },
                    totalOpened: { $sum: "$metrics.opened" },
                    totalClicked: { $sum: "$metrics.clicked" }
                }
            }
        ]);

        // Transform delivery stats for chart - ensure we always have some data to show
        const deliveryStatsForChart = deliveryStats.length > 0 ? [
            { _id: "sent", count: deliveryStats[0].totalSent || 0 },
            { _id: "delivered", count: deliveryStats[0].totalDelivered || 0 },
            { _id: "failed", count: deliveryStats[0].totalFailed || 0 },
            { _id: "pending", count: Math.max(0, (deliveryStats[0].totalSent || 0) - (deliveryStats[0].totalDelivered || 0) - (deliveryStats[0].totalFailed || 0)) }
        ].filter(item => item.count > 0) : [  // Filter out zero values
            { _id: "sent", count: 1 },  // Show at least some data for visualization
        ];

        // If no delivery stats, show the sent messages as "pending" (more realistic)
        if (deliveryStatsForChart.length === 1 && deliveryStatsForChart[0]._id === "sent") {
            deliveryStatsForChart[0] = { _id: "pending", count: deliveryStatsForChart[0].count };
        }

        // Get campaign type distribution
        const campaignTypes = await Campaign.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                }
            }
        ]);

        // Get audience size trends
        const audienceTrends = await AudienceSegment.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalAudienceSize: { $sum: "$audienceSize" },
                    segmentCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get recent activity (last 30 days) from campaigns - extended range to show more data
        const thirtyDaysAgoForActivity = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentActivity = await Campaign.aggregate([
            { $match: { createdBy: userId, createdAt: { $gte: thirtyDaysAgoForActivity } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sent: { $sum: "$metrics.sent" },
                    failed: { $sum: "$metrics.failed" },
                    pending: { $sum: { $subtract: ["$metrics.sent", { $add: ["$metrics.delivered", "$metrics.failed"] }] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get top performing campaigns
        const topCampaigns = await Campaign.aggregate([
            { $match: { createdBy: userId } },
            {
                $addFields: {
                    totalSent: "$metrics.sent",
                    totalFailed: "$metrics.failed",
                    totalDelivered: "$metrics.delivered",
                    successRate: {
                        $cond: {
                            if: { $gt: ["$metrics.sent", 0] },
                            then: {
                                $multiply: [
                                    {
                                        $divide: [
                                            "$metrics.delivered",
                                            "$metrics.sent"
                                        ]
                                    },
                                    100
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            { $sort: { successRate: -1, totalSent: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    type: 1,
                    status: 1,
                    totalSent: 1,
                    totalFailed: 1,
                    totalDelivered: 1,
                    successRate: { $round: ['$successRate', 1] },
                    createdAt: 1
                }
            }
        ]);

        // Calculate key metrics
        const totalCampaigns = await Campaign.countDocuments({ createdBy: userId });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAudienceSegments = await AudienceSegment.countDocuments({ createdBy: userId });
        
        // Calculate total messages and success rate from campaign metrics
        const totalMessagesResult = await Campaign.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: "$metrics.sent" },
                    totalDelivered: { $sum: "$metrics.delivered" }
                }
            }
        ]);
        
        const totalMessages = totalMessagesResult.length > 0 ? totalMessagesResult[0].totalSent : 0;
        const successfulMessages = totalMessagesResult.length > 0 ? totalMessagesResult[0].totalDelivered : 0;
        const overallSuccessRate = totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;

        console.log("Analytics Debug:", {
            totalCampaigns,
            totalCustomers,
            totalAudienceSegments,
            totalMessages,
            successfulMessages,
            overallSuccessRate,
            campaignPerformance: campaignPerformance.length,
            deliveryStatsForChart: deliveryStatsForChart.length,
            campaignTypes: campaignTypes.length,
            topCampaigns: topCampaigns.length
        });

        res.json({
            success: true,
            data: {
                metrics: {
                    totalCampaigns,
                    totalCustomers,
                    totalAudienceSegments,
                    totalMessages,
                    successfulMessages,
                    overallSuccessRate: Math.round(overallSuccessRate * 10) / 10
                },
                charts: {
                    campaignPerformance,
                    deliveryStats: deliveryStatsForChart,
                    campaignTypes,
                    audienceTrends,
                    recentActivity
                },
                topCampaigns
            }
        });

    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics data'
        });
    }
});

// @desc    Reset campaign to realistic demo values
// @access  Public (for demo purposes)
router.post('/reset-demo', async (req, res) => {
    try {
        const { audienceSize = 1, sent = 1, delivered = 1, failed = 0, opened = 1, clicked = 0 } = req.body;
        
        // Update all campaigns to realistic values
        await Campaign.updateMany({}, {
            status: 'completed',
            'metrics.audienceSize': audienceSize,
            'metrics.sent': sent,
            'metrics.delivered': delivered,
            'metrics.failed': failed,
            'metrics.opened': opened,
            'metrics.clicked': clicked
        });
        
        res.json({
            success: true,
            message: 'Demo data reset to realistic values',
            metrics: { audienceSize, sent, delivered, failed, opened, clicked }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;