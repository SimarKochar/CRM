const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const AudienceSegment = require('../models/AudienceSegment');

const router = express.Router();

// Validation schemas
const segmentSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(5).max(500).required(),
    rules: Joi.array().items(
        Joi.object({
            field: Joi.string().valid(
                'totalSpent', 'orderCount', 'lastPurchase', 'lastLogin',
                'visits', 'age', 'location', 'signupDate', 'customerLifetimeValue'
            ).required(),
            operator: Joi.string().valid('>', '<', '>=', '<=', '=', '!=', 'contains', 'in', 'not_in').required(),
            value: Joi.string().required(),
            logic: Joi.string().valid('AND', 'OR').allow(null)
        })
    ).min(1).required(),
    tags: Joi.array().items(Joi.string())
});

// @route   GET /api/audience
// @desc    Get all audience segments for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const segments = await AudienceSegment.findByUser(req.user.id);

        res.status(200).json({
            success: true,
            count: segments.length,
            data: { segments }
        });
    } catch (error) {
        console.error('Get segments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching audience segments'
        });
    }
});

// @route   POST /api/audience
// @desc    Create new audience segment
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = segmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Create segment
        const segment = await AudienceSegment.create({
            ...req.body,
            createdBy: req.user.id
        });

        // Calculate audience size
        await segment.calculateAudienceSize();

        res.status(201).json({
            success: true,
            message: 'Audience segment created successfully',
            data: { segment }
        });
    } catch (error) {
        console.error('Create segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating audience segment'
        });
    }
});

// @route   GET /api/audience/:id
// @desc    Get specific audience segment
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const segment = await AudienceSegment.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        }).populate('createdBy', 'name email');

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Audience segment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { segment }
        });
    } catch (error) {
        console.error('Get segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching audience segment'
        });
    }
});

// @route   PUT /api/audience/:id
// @desc    Update audience segment
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = segmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const segment = await AudienceSegment.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Audience segment not found'
            });
        }

        // Recalculate audience size
        await segment.calculateAudienceSize();

        res.status(200).json({
            success: true,
            message: 'Audience segment updated successfully',
            data: { segment }
        });
    } catch (error) {
        console.error('Update segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating audience segment'
        });
    }
});

// @route   DELETE /api/audience/:id
// @desc    Delete audience segment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const segment = await AudienceSegment.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Audience segment not found'
            });
        }

        // Soft delete - mark as inactive
        segment.isActive = false;
        await segment.save();

        res.status(200).json({
            success: true,
            message: 'Audience segment deleted successfully'
        });
    } catch (error) {
        console.error('Delete segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting audience segment'
        });
    }
});

// @route   POST /api/audience/:id/preview
// @desc    Preview audience size for segment
// @access  Private
router.post('/:id/preview', auth, async (req, res) => {
    try {
        const segment = await AudienceSegment.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Audience segment not found'
            });
        }

        // Calculate fresh audience size
        await segment.calculateAudienceSize();

        res.status(200).json({
            success: true,
            data: {
                audienceSize: segment.audienceSize,
                estimatedReach: segment.estimatedReach
            }
        });
    } catch (error) {
        console.error('Preview segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while previewing audience segment'
        });
    }
});

// @route   POST /api/audience/preview
// @desc    Preview audience size for new segment rules
// @access  Private
router.post('/preview', auth, async (req, res) => {
    try {
        // Validate rules
        const { error } = Joi.object({
            rules: Joi.array().items(
                Joi.object({
                    field: Joi.string().required(),
                    operator: Joi.string().required(),
                    value: Joi.string().required(),
                    logic: Joi.string().valid('AND', 'OR').allow(null)
                })
            ).min(1).required()
        }).validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Create temporary segment for calculation
        const tempSegment = new AudienceSegment({
            name: 'temp',
            description: 'temp',
            rules: req.body.rules,
            createdBy: req.user.id
        });

        await tempSegment.calculateAudienceSize();

        res.status(200).json({
            success: true,
            data: {
                audienceSize: tempSegment.audienceSize,
                estimatedReach: tempSegment.estimatedReach
            }
        });
    } catch (error) {
        console.error('Preview rules error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while previewing audience rules'
        });
    }
});

module.exports = router;
