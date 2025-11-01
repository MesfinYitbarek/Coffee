 import { Schema, model } from 'mongoose';

    const coffeePriceSchema = new Schema({
        coffeeType: {
            type: String,
            required: true,
            enum: ['Local Unwashed', 'Local Washed', 'Local Sidama Washed', 'Local Washed Yirgacheffe'],
        },
        grade: {
            type: String,
            required: true,
            trim: true,
        },
        lowerPrice: {
            type: Number,
            default: null, // Can be null if not available
        },
        upperPrice: {
            type: Number,
            default: null, // Can be null if not available
        },
        dateUpdated: { // To track when this price was last updated
            type: Date,
            default: Date.now,
        },
    }, { timestamps: true });

    // Ensure unique combination of coffeeType and grade
    coffeePriceSchema.index({ coffeeType: 1, grade: 1 }, { unique: true });

    const CoffeePrice = model('CoffeePrice', coffeePriceSchema);
    export default CoffeePrice;