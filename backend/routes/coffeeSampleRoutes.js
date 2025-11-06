import { Router } from 'express';
const router = Router();

import CoffeeSample from '../models/CoffeeSample.js';
import Warehouse from '../models/Warehouse.js';
import authMiddleware from '../middleware/authMiddleware.js';
const { protect, admin } = authMiddleware;
import cloudinary from '../config/cloudinary.js';

import multer from "multer";
const upload = multer(); // Only parse form-data fields



console.log("Cloudinary Config Loaded:", cloudinary.config());


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

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'coffee-samples') =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    }).end(fileBuffer);
  });

// ✅ Create coffee sample
router.post('/', protect, admin, upload.single('imageData'), async (req, res) => {
  try {
    const { grnNumber, warehouseId } = req.body;
    if (!grnNumber || !warehouseId) return res.status(400).json({ message: 'GRN and warehouse are required' });

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const sample = await CoffeeSample.create({
      grnNumber,
      warehouse: warehouseId,
      imageUrl,
    });

    res.status(201).json(sample);
  } catch (error) {
    console.error('Create sample error:', error);
    res.status(500).json({ message: 'Failed to create sample', error: error.message });
  }
});

// ✅ Update coffee sample
router.put('/:id', protect, admin, upload.single('imageData'), async (req, res) => {
  try {
    const { grnNumber, warehouseId } = req.body;
    const sample = await CoffeeSample.findById(req.params.id);
    if (!sample) return res.status(404).json({ message: 'Sample not found' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      sample.imageUrl = result.secure_url;
    }

    sample.grnNumber = grnNumber || sample.grnNumber;
    sample.warehouse = warehouseId || sample.warehouse;

    const updated = await sample.save();
    res.json(updated);
  } catch (error) {
    console.error('Update sample error:', error);
    res.status(500).json({ message: 'Failed to update sample', error: error.message });
  }
});


// ✅ Get Coffee Samples + Filters
router.get('/', async (req, res) => {
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
