import { Schema, model } from 'mongoose';

    const marketInfoSchema = new Schema({
        date: {
            type: Date,
            required: true,
            unique: true, // Only one entry per day
        },
        imageUrl: {
            type: String, // Stored from Cloudinary
            required: true,
        },
        description: { // Optional: text description for the market info
            type: String,
            trim: true,
        },
    }, { timestamps: true });

    const MarketInfo = model('MarketInfo', marketInfoSchema);
    export default MarketInfo;