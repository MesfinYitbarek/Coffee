import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js'; 
import MarketInfo from '../models/MarketInfo.js';
import CoffeePrice from '../models/CoffeePrice.js';
import authMiddleware from '../middleware/authMiddleware.js';

const { protect, admin } = authMiddleware;
const router = Router();

// 🔹 Configure Multer (in-memory storage for file uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =====================================================
   🟢 MARKET INFO ROUTES
===================================================== */

/**
 * ✅ Add daily market information
 */
router.post('/info', protect, admin, upload.single('imageData'), async (req, res) => {
  const { date, description } = req.body;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const existingInfo = await MarketInfo.findOne({ date: new Date(date) });
    if (existingInfo) {
      return res.status(400).json({ message: 'Market information for this date already exists.' });
    }

    let imageUrl = '';

    // 🔹 Upload image to Cloudinary if file exists
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'market-info' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const marketInfo = new MarketInfo({
      date: new Date(date),
      description,
      imageUrl,
    });

    const createdInfo = await marketInfo.save();
    res.status(201).json(createdInfo);
  } catch (error) {
    console.error('Error adding market info:', error);
    res.status(400).json({ message: 'Failed to add market info', error: error.message });
  }
});

/**
 * ✅ Update market info
 */
router.put('/info/:id', protect, admin, upload.single('imageData'), async (req, res) => {
  const { date, description } = req.body;

  try {
    const marketInfo = await MarketInfo.findById(req.params.id);
    if (!marketInfo) {
      return res.status(404).json({ message: 'Market information not found' });
    }

    if (date) marketInfo.date = new Date(date);
    if (description) marketInfo.description = description;

    if (req.file) {
      if (marketInfo.imageUrl) {
        const publicId = marketInfo.imageUrl.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`market-info/${publicId}`);
        } catch (error) {
          console.error('Cloudinary delete error:', error.message);
        }
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'market-info' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      marketInfo.imageUrl = result.secure_url;
    }

    const updatedInfo = await marketInfo.save();
    res.json({ message: 'Market information updated successfully', data: updatedInfo });
  } catch (error) {
    console.error('Error updating market info:', error);
    res.status(500).json({ message: 'Failed to update market information', error: error.message });
  }
});

/**
 * ✅ Delete market info
 */
router.delete('/info/:id', protect, admin, async (req, res) => {
  try {
    const marketInfo = await MarketInfo.findById(req.params.id);
    if (!marketInfo) {
      return res.status(404).json({ message: 'Market information not found' });
    }

    if (marketInfo.imageUrl) {
      const publicId = marketInfo.imageUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`market-info/${publicId}`);
      } catch (err) {
        console.error('Cloudinary deletion error:', err.message);
      }
    }

    await marketInfo.deleteOne();
    res.json({ message: 'Market information deleted successfully' });
  } catch (error) {
    console.error('Error deleting market info:', error);
    res.status(500).json({ message: 'Failed to delete market information', error: error.message });
  }
});

/**
 * ✅ Get all market info
 */
router.get('/info', protect, async (req, res) => {
  try {
    const marketInfos = await MarketInfo.find({}).sort({ date: -1 });
    res.json(marketInfos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch market info', error: error.message });
  }
});

/* =====================================================
   ☕ COFFEE PRICE ROUTES
===================================================== */

/**
 * ✅ Add or update coffee price (already existed)
 */
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

/**
 * ✅ Edit coffee price by ID
 */
router.put('/prices/:id', protect, admin, async (req, res) => {
  const { lowerPrice, upperPrice } = req.body;

  try {
    const coffeePrice = await CoffeePrice.findById(req.params.id);
    if (!coffeePrice) {
      return res.status(404).json({ message: 'Coffee price not found' });
    }

    if (lowerPrice !== undefined) coffeePrice.lowerPrice = lowerPrice;
    if (upperPrice !== undefined) coffeePrice.upperPrice = upperPrice;
    coffeePrice.dateUpdated = Date.now();

    const updatedPrice = await coffeePrice.save();
    res.json({ message: 'Coffee price updated successfully', data: updatedPrice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit coffee price', error: error.message });
  }
});

/**
 * ✅ Delete coffee price by ID
 */
router.delete('/prices/:id', protect, admin, async (req, res) => {
  try {
    const coffeePrice = await CoffeePrice.findById(req.params.id);
    if (!coffeePrice) {
      return res.status(404).json({ message: 'Coffee price not found' });
    }

    await coffeePrice.deleteOne();
    res.json({ message: 'Coffee price deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coffee price', error: error.message });
  }
});

/**
 * ✅ Get all coffee prices
 */
router.get('/prices', protect, async (req, res) => {
  try {
    const coffeePrices = await CoffeePrice.find({}).sort({ coffeeType: 1, grade: 1 });
    res.json(coffeePrices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coffee prices', error: error.message });
  }
});

export default router;
