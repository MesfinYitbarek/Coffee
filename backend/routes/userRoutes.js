import { Router } from 'express';
import User from '../models/User.js';
import jwt from "jsonwebtoken";
const { sign } = jwt;
import authMiddleware from '../middleware/authMiddleware.js';
const { protect } = authMiddleware;


const router = Router();

// Generate JWT Token
const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
// Activate free trial
// ✅ Select package after payment
router.post('/select-package', protect, async (req, res) => {
    const { packageType } = req.body;
    const user = req.user;

    if (!packageType || !['monthly', 'quarterly'].includes(packageType)) {
        return res.status(400).json({ message: 'Invalid package type' });
    }

    try {
        user.packageType = packageType;
        user.isActive = false; // User waits for admin to confirm payment
        user.packageExpiresAt = null;
        user.paymentConfirmed = false; // Admin needs to confirm
        await user.save();

        res.json({ message: `Package ${packageType} selected. Waiting for admin activation.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update package' });
    }
});

// ✅ Start free trial
router.post('/free-trial', protect, async (req, res) => {
    const user = req.user;

    try {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);

        user.packageType = 'free_trial';
        user.isActive = true;
        user.packageExpiresAt = expiry;
        user.paymentConfirmed = true; // No admin confirmation needed for free trial
        await user.save();

        res.json({ message: 'Free trial started successfully!', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to start free trial' });
    }
});

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

  // Create new user — not active until they choose a package
  const user = await User.create({
    name,
    phoneNumber,
    emailAddress,
    password,
    isActive: false,
    packageType: 'none',
  });

  if (user) {
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
      message: 'Registration successful! Please select a subscription package.',
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
