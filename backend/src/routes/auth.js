/**
 * Authentication Routes
 * Handles user registration, login via Clerk webhooks
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authMiddleware, attachUser } = require('../middleware/auth');

/**
 * Clerk webhook handler - creates/updates user on Clerk events
 * POST /api/auth/webhook
 */
router.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  try {
    switch (type) {
      case 'user.created':
        // Create user in our database
        await User.create({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone_numbers[0]?.phone_number,
          role: 'owner' // Default role for new signups
        });
        break;

      case 'user.updated':
        // Update user in our database
        await User.update(
          {
            email: data.email_addresses[0]?.email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone_numbers[0]?.phone_number
          },
          { where: { clerkId: data.id } }
        );
        break;

      case 'user.deleted':
        // Soft delete or anonymize user
        await User.update(
          { isActive: false },
          { where: { clerkId: data.id } }
        );
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', authMiddleware, attachUser, async (req, res) => {
  if (!req.user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      companyName: req.user.companyName,
      companyLogo: req.user.companyLogo,
      brandingColors: req.user.brandingColors,
      settings: req.user.settings
    }
  });
});

/**
 * Update user profile
 * PATCH /api/auth/profile
 */
router.patch('/profile', authMiddleware, attachUser, async (req, res) => {
  const { companyName, phone, brandingColors, settings } = req.body;

  await req.user.update({
    companyName,
    phone,
    brandingColors,
    settings
  });

  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;
