// backend/models/Warehouse.js
import { Schema, model } from 'mongoose';

const warehouseSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    location: { // Optional: city, region, etc.
        type: String,
        trim: true,
    },
}, { timestamps: true });

const Warehouse = model('Warehouse', warehouseSchema);
export default Warehouse;