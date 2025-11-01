import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true, // Phone number should be unique for login
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActive: { // For paid/free trial activation
        type: Boolean,
        default: false,
    },
    packageType: { // e.g., 'free_trial', 'monthly', 'quarterly'
        type: String,
        enum: ['none', 'free_trial', 'monthly', 'quarterly'],
        default: 'none',
    },
    packageExpiresAt: { // Date when the package expires
        type: Date,
        default: null,
    },
    paymentConfirmed: { // To track if admin confirmed payment
        type: Boolean,
        default: false
    },
    // Add other fields as needed for package management, etc.
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await compare(enteredPassword, this.password);
};

const User = model('User', userSchema);
export default User;