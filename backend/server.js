
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors'; // Import cors
import userRoutes from "./routes/userRoutes.js"
import coffeeSampleRoutes from "./routes/coffeeSampleRoutes.js"
import marketRoutes from "./routes/marketRoutes.js"
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Use cors middleware
app.use(json()); // Allows us to get data in json format

// MongoDB Connection
connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);
app.use('/api/coffee-samples', coffeeSampleRoutes); // Use coffee sample routes
app.use('/api/warehouses', coffeeSampleRoutes);
app.use('/api/market', marketRoutes);
// Basic Route
app.get('/', (req, res) => {
    res.send('Coffee Calculator API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});