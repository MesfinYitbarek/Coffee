import { Router } from 'express';
const router = Router();

import MarketInfo from '../models/MarketInfo.js';
import CoffeePrice from '../models/CoffeePrice.js';

import authMiddleware from '../middleware/authMiddleware.js';
const { protect, admin } = authMiddleware;

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config (make sure your .env has CLOUDINARY vars)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Add daily market information
router.post('/info', protect, admin, async (req, res) => {
    const { date, imageData, description } = req.body;

    try {
        // Check existing entry
        const existingInfo = await MarketInfo.findOne({ date: new Date(date) });
        if (existingInfo) {
            return res.status(400).json({ message: 'Market information for this date already exists.' });
        }

        // Upload image
        const uploadResponse = await cloudinary.uploader.upload(imageData, {
            folder: 'market-info',
        });

        if (!uploadResponse.secure_url) {
            return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        const marketInfo = new MarketInfo({
            date: new Date(date),
            imageUrl: uploadResponse.secure_url,
            description,
        });

        const createdInfo = await marketInfo.save();
        res.status(201).json(createdInfo);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add market info', error: error.message });
    }
});

// ✅ Get all daily market info
router.get('/info', protect, async (req, res) => {
    try {
        const marketInfos = await MarketInfo.find({}).sort({ date: -1 });
        res.json(marketInfos);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch market info', error: error.message });
    }
});

// ✅ Create / Update Coffee Price Range
router.post('/prices', protect, admin, async (req, res) => {
    const { coffeeType, grade, lowerPrice, upperPrice } = req.body;

    try {
        const updatedPrice = await CoffeePrice.findOneAndUpdate(
            { coffeeType, grade },
            { lowerPrice, upperPrice, dateUpdated: Date.now() },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json(updatedPrice);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update coffee price', error: error.message });
    }
});

// ✅ Get all coffee price ranges
router.get('/prices', protect, async (req, res) => {
    try {
        const coffeePrices = await CoffeePrice.find({}).sort({ coffeeType: 1, grade: 1 });
        res.json(coffeePrices);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coffee prices', error: error.message });
    }
});

export default router;
