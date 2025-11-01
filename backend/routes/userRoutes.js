import { Router } from 'express';
import User from '../models/User.js';
import jwt from "jsonwebtoken";
const { sign } = jwt;


const router = Router();

// Generate JWT Token
const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// REGISTER USER
router.post('/register', async (req, res) => {
  const { name, phoneNumber, emailAddress, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ phoneNumber }, { emailAddress }],
  });

  if (userExists) {
    return res.status(400).json({
      message: 'User with this phone number or email already exists',
    });
  }

  // Create new user
  const user = await User.create({
    name,
    phoneNumber,
    emailAddress,
    password,
  });

  if (user) {
    // Activate 7-day trial
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    user.isActive = true;
    user.packageType = 'free_trial';
    user.packageExpiresAt = expiry;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      emailAddress: user.emailAddress,
      role: user.role,
      isActive: user.isActive,
      packageType: user.packageType,
      packageExpiresAt: user.packageExpiresAt,
      token: generateToken(user._id),
      message: 'Registration successful! Free trial activated for 7 days.',
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  const user = await User.findOne({ phoneNumber });

  if (user && (await user.matchPassword(password))) {
    // Check subscription status
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Your account is not active. Please subscribe or contact admin.',
      });
    }

    if (user.packageExpiresAt && user.packageExpiresAt < new Date()) {
      user.isActive = false;
      user.packageType = 'none';
      user.packageExpiresAt = null;
      await user.save();

      return res.status(401).json({
        message: 'Subscription expired. Please renew.',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      emailAddress: user.emailAddress,
      role: user.role,
      isActive: user.isActive,
      packageType: user.packageType,
      packageExpiresAt: user.packageExpiresAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid phone number or password' });
  }
});

export default router;
