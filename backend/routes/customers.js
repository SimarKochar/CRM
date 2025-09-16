const express = require('express');
const User = require('../models/User'); // We'll use User as Customer for now since no demo data allowed
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers - Get all customers (ADMIN ONLY)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status || '';

        // Build search query - only get customers created by this admin
        let query = { role: 'customer', createdBy: req.user.id };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
            // Keep the role and createdBy filters when searching
            query.role = 'customer';
            query.createdBy = req.user.id;
        }
        if (status) {
            query.status = status;
        }

        const customers = await User.find(query)
            .select('-password -googleId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
});

// GET /api/customers/:id - Get single customer (ADMIN ONLY)
router.get('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-password -googleId');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
});

// POST /api/customers - Create new customer (ADMIN ONLY)
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        console.log('Creating customer with data:', req.body);
        const { name, email, phone, location, company, notes, status, totalSpent, orders } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if customer with email already exists
        const existingCustomer = await User.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this email already exists'
            });
        }

        const customer = new User({
            name,
            email,
            phone,
            location,
            company,
            notes,
            status: status || 'Active',
            totalSpent: totalSpent || 0,
            orders: orders || 0,
            visits: orders || 0, // Default visits to orders count
            role: 'customer',
            password: undefined, // Explicitly set password as undefined for customers
            createdBy: req.user.id
        });

        await customer.save();

        console.log('Customer created successfully:', customer._id);
        res.status(201).json({
            success: true,
            data: customer,
            message: 'Customer created successfully'
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
});

// PUT /api/customers/:id - Update customer (ADMIN ONLY)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const { name, email, phone, location, company, notes, status, totalSpent, orders } = req.body;

        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Update fields
        if (name) customer.name = name;
        if (email) customer.email = email;
        if (phone) customer.phone = phone;
        if (location) customer.location = location;
        if (company) customer.company = company;
        if (notes) customer.notes = notes;
        if (status) customer.status = status;
        if (totalSpent !== undefined) customer.totalSpent = parseFloat(totalSpent) || 0;
        if (orders !== undefined) {
            customer.orders = parseInt(orders) || 0;
            customer.visits = parseInt(orders) || 0; // Update visits too
        }

        await customer.save();

        res.json({
            success: true,
            data: customer,
            message: 'Customer updated successfully'
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating customer',
            error: error.message
        });
    }
});

// DELETE /api/customers/:id - Delete customer (ADMIN ONLY)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting customer',
            error: error.message
        });
    }
});

// GET /api/customers/stats - Get customer statistics (ADMIN ONLY)
router.get('/stats/overview', auth, authorize('admin'), async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $match: { role: 'customer' }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    activeCustomers: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    inactiveCustomers: {
                        $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalCustomers: 0,
            activeCustomers: 0,
            inactiveCustomers: 0
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer statistics',
            error: error.message
        });
    }
});

module.exports = router;