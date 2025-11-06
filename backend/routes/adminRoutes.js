import { Router } from 'express';
const router = Router();

import User from '../models/User.js';
import CoffeeSample from '../models/CoffeeSample.js';
import MarketInfo from '../models/MarketInfo.js';
import CoffeePrice from '../models/CoffeePrice.js';
import Warehouse from '../models/Warehouse.js';

import authMiddleware from '../middleware/authMiddleware.js';
const { protect, admin } = authMiddleware;

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with pagination and filters
router.get('/users', protect, admin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, packageType, isActive } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (packageType && packageType !== 'all') {
            query.packageType = packageType;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await User.countDocuments(query);
        
        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

// Get user statistics
router.get('/users/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const freeTrialUsers = await User.countDocuments({ packageType: 'free_trial' });
        const monthlyUsers = await User.countDocuments({ packageType: 'monthly' });
        const quarterlyUsers = await User.countDocuments({ packageType: 'quarterly' });
        const pendingPayments = await User.countDocuments({ 
            paymentConfirmed: false, 
            packageType: { $in: ['monthly', 'quarterly'] } 
        });
        
        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            freeTrialUsers,
            monthlyUsers,
            quarterlyUsers,
            pendingPayments
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
    }
});

// Get single user details
router.get('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
});

// Activate user subscription
router.put('/users/:id/activate', protect, admin, async (req, res) => {
    try {
        const { packageType } = req.body; // 'monthly' or 'quarterly'
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let daysToAdd = 0;
        if (packageType === 'monthly') {
            daysToAdd = 30;
        } else if (packageType === 'quarterly') {
            daysToAdd = 90;
        } else {
            return res.status(400).json({ message: 'Invalid package type' });
        }
        
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + daysToAdd);
        
        user.isActive = true;
        user.packageType = packageType;
        user.packageExpiresAt = expiry;
        user.paymentConfirmed = true;
        
        await user.save();
        
        res.json({ 
            message: 'User activated successfully', 
            user: {
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                isActive: user.isActive,
                packageType: user.packageType,
                packageExpiresAt: user.packageExpiresAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to activate user', error: error.message });
    }
});

// Deactivate user
router.put('/users/:id/deactivate', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isActive = false;
        user.packageType = 'none';
        user.packageExpiresAt = null;
        user.paymentConfirmed = false;
        
        await user.save();
        
        res.json({ message: 'User deactivated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to deactivate user', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }
        
        await user.deleteOne();
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

// Extend user subscription
router.put('/users/:id/extend', protect, admin, async (req, res) => {
    try {
        const { days } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const currentExpiry = user.packageExpiresAt || new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + parseInt(days));
        
        user.packageExpiresAt = newExpiry;
        user.isActive = true;
        
        await user.save();
        
        res.json({ message: 'Subscription extended successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to extend subscription', error: error.message });
    }
});

// ============================================
// WAREHOUSE MANAGEMENT
// ============================================

// Get all warehouses
router.get('/warehouses', protect, admin, async (req, res) => {
    try {
        const warehouses = await Warehouse.find({}).sort({ name: 1 });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch warehouses', error: error.message });
    }
});

// Update warehouse
router.put('/warehouses/:id', protect, admin, async (req, res) => {
    try {
        const { name, location } = req.body;
        
        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            { name, location },
            { new: true, runValidators: true }
        );
        
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        
        res.json(warehouse);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update warehouse', error: error.message });
    }
});

// Delete warehouse
router.delete('/warehouses/:id', protect, admin, async (req, res) => {
    try {
        // Check if warehouse is in use
        const samplesCount = await CoffeeSample.countDocuments({ warehouse: req.params.id });
        
        if (samplesCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete warehouse. It has ${samplesCount} coffee samples associated with it.` 
            });
        }
        
        const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
        
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete warehouse', error: error.message });
    }
});

// ============================================
// COFFEE SAMPLE MANAGEMENT
// ============================================

// Get all coffee samples (admin view)
router.get('/samples', protect, admin, async (req, res) => {
    try {
        const samples = await CoffeeSample.find({})
            .populate('warehouse', 'name location')
            .sort({ dateAdded: -1 });
        
        res.json(samples);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch samples', error: error.message });
    }
});

// Delete coffee sample
router.delete('/samples/:id', protect, admin, async (req, res) => {
    try {
        const sample = await CoffeeSample.findByIdAndDelete(req.params.id);
        
        if (!sample) {
            return res.status(404).json({ message: 'Sample not found' });
        }
        
        res.json({ message: 'Sample deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete sample', error: error.message });
    }
});

// ============================================
// MARKET INFO MANAGEMENT
// ============================================

// Update market info
router.put('/market-info/:id', protect, admin, async (req, res) => {
    try {
        const { description } = req.body;
        
        const marketInfo = await MarketInfo.findByIdAndUpdate(
            req.params.id,
            { description },
            { new: true, runValidators: true }
        );
        
        if (!marketInfo) {
            return res.status(404).json({ message: 'Market info not found' });
        }
        
        res.json(marketInfo);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update market info', error: error.message });
    }
});

// Delete market info
router.delete('/market-info/:id', protect, admin, async (req, res) => {
    try {
        const marketInfo = await MarketInfo.findByIdAndDelete(req.params.id);
        
        if (!marketInfo) {
            return res.status(404).json({ message: 'Market info not found' });
        }
        
        res.json({ message: 'Market info deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete market info', error: error.message });
    }
});

// ============================================
// DASHBOARD STATS
// ============================================

router.get('/dashboard/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalSamples = await CoffeeSample.countDocuments();
        const totalWarehouses = await Warehouse.countDocuments();
        const pendingActivations = await User.countDocuments({ 
            paymentConfirmed: false, 
            packageType: { $in: ['monthly', 'quarterly'] } 
        });
        
        // Revenue calculation (approximate)
        const monthlySubscribers = await User.countDocuments({ packageType: 'monthly', isActive: true });
        const quarterlySubscribers = await User.countDocuments({ packageType: 'quarterly', isActive: true });
        const estimatedMonthlyRevenue = (monthlySubscribers * 1000) + (quarterlySubscribers * 3000);
        
        res.json({
            totalUsers,
            activeUsers,
            totalSamples,
            totalWarehouses,
            pendingActivations,
            estimatedMonthlyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
});

export default router;