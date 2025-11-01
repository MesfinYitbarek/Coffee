import { Router } from 'express';
const router = Router();

import CoffeeSample from '../models/CoffeeSample.js';
import Warehouse from '../models/Warehouse.js';
import authMiddleware from '../middleware/authMiddleware.js';
const { protect, admin } = authMiddleware;

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (add CLOUDINARY_URL to .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET Warehouses
router.get('/warehouses', protect, async (req, res) => {
    try {
        const warehouses = await Warehouse.find({});
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch warehouses' });
    }
});

// ✅ Add Warehouse (Admin only)
router.post('/warehouses', protect, admin, async (req, res) => {
    const { name, location } = req.body;
    try {
        const warehouse = new Warehouse({ name, location });
        const createdWarehouse = await warehouse.save();
        res.status(201).json(createdWarehouse);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add warehouse', error: error.message });
    }
});

// ✅ Upload image & create coffee sample
router.post('/', protect, admin, async (req, res) => {
    const { grnNumber, warehouseId, imageData } = req.body;

    try {
        const uploadResponse = await cloudinary.uploader.upload(imageData, {
            folder: 'coffee-samples',
        });

        if (!uploadResponse.secure_url) {
            return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        const coffeeSample = new CoffeeSample({
            grnNumber,
            warehouse: warehouseId,
            imageUrl: uploadResponse.secure_url,
        });

        const createdSample = await coffeeSample.save();
        res.status(201).json(createdSample);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add coffee sample', error: error.message });
    }
});

// ✅ Get Coffee Samples + Filters
router.get('/', protect, async (req, res) => {
    const { grn, warehouse, favorites } = req.query;
    const query = {};

    if (grn) query.grnNumber = { $regex: grn, $options: 'i' };
    if (warehouse) query.warehouse = warehouse;
    if (favorites && req.user) query.favoritedBy = req.user._id;

    try {
        const samples = await CoffeeSample.find(query)
            .populate('warehouse', 'name')
            .sort({ dateAdded: -1 });

        const samplesByDay = {};
        samples.forEach(sample => {
            const dateKey = new Date(sample.dateAdded).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!samplesByDay[dateKey]) {
                samplesByDay[dateKey] = { date: dateKey, count: 0, items: [] };
            }
            samplesByDay[dateKey].count++;
            samplesByDay[dateKey].items.push(sample);
        });

        res.json(Object.values(samplesByDay));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch samples', error: error.message });
    }
});

// ✅ Toggle favorite
router.put('/:id/favorite', protect, async (req, res) => {
    try {
        const sample = await CoffeeSample.findById(req.params.id);

        if (!sample) return res.status(404).json({ message: 'Sample not found' });

        const isFavorited = sample.favoritedBy.includes(req.user._id);

        sample.favoritedBy = isFavorited
            ? sample.favoritedBy.filter(id => id.toString() !== req.user._id.toString())
            : [...sample.favoritedBy, req.user._id];

        await sample.save();
        res.json({ message: 'Favorite status updated', sample });

    } catch (error) {
        res.status(500).json({ message: 'Error updating favorite', error: error.message });
    }
});

export default router;
