// backend/models/CoffeeSample.js
import { Schema, model } from 'mongoose';

const coffeeSampleSchema = new Schema({
    imageUrl: {
        type: String, // Stored from Cloudinary
        required: true,
    },
    grnNumber: { // Goods Received Note number
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse', // Reference to the Warehouse model
        required: true,
    },
    dateAdded: {
        type: Date,
        default: Date.now,
    },
    favoritedBy: [{ // Array of user IDs who favorited this sample
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const CoffeeSample = model('CoffeeSample', coffeeSampleSchema);
export default CoffeeSample;