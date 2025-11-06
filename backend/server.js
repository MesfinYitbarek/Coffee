
import dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from "./routes/userRoutes.js";
import coffeeSampleRoutes from "./routes/coffeeSampleRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



const app = express();
const PORT = process.env.PORT || 5000;

// For ES modules: get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(json());
console.log('Cloudinary Key:', process.env.CLOUDINARY_API_KEY);
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Cloudinary Secret:', process.env.CLOUDINARY_API_SECRET);
// MongoDB connection
connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
app.use('/api/users', userRoutes);
app.use('/api/coffee-samples', coffeeSampleRoutes);
app.use('/api/warehouses', coffeeSampleRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Serve React frontend
const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath));

// ✅ Catch-all route for React (for Express v5+)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
