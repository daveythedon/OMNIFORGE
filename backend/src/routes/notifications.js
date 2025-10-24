/**
 * Notifications Routes
 * Handles real-time notification center
 */

const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all notifications for user
 * GET /api/notifications
 * Query params: ?unread=true&limit=50
 */
router.get('/', async (req, res) => {
  const { unread, limit = 50, offset = 0 } = req.query;

  const where = { userId: req.user.id };
  if (unread === 'true') {
    where.isRead = false;
  }

  const notifications = await Notification.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const unreadCount = await Notification.count({
    where: {
      userId: req.user.id,
      isRead: false
    }
  });

  res.json({
    success: true,
    data: notifications,
    meta: {
      unreadCount,
      total: notifications.length
    }
  });
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    where: { id, userId: req.user.id }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  await notification.update({
    isRead: true,
    readAt: new Date()
  });

  res.json({
    success: true,
    data: notification
  });
});

/**
 * Mark all notifications as read
 * POST /api/notifications/mark-all-read
 */
router.post('/mark-all-read', async (req, res) => {
  await Notification.update(
    {
      isRead: true,
      readAt: new Date()
    },
    {
      where: {
        userId: req.user.id,
        isRead: false
      }
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deleted = await Notification.destroy({
    where: { id, userId: req.user.id }
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', async (req, res) => {
  const count = await Notification.count({
    where: {
      userId: req.user.id,
      isRead: false
    }
  });

  res.json({
    success: true,
    data: { count }
  });
});

/**
 * Create notification (helper endpoint for testing)
 * POST /api/notifications
 */
router.post('/', async (req, res) => {
  const { type, title, message, priority, metadata } = req.body;

  const notification = await Notification.create({
    userId: req.user.id,
    type,
    title,
    message,
    priority: priority || 'medium',
    metadata: metadata || {}
  });

  // Emit real-time notification
  const io = req.app.get('io');
  io.to(`company-${req.user.id}`).emit('new-notification', notification);

  res.status(201).json({
    success: true,
    data: notification
  });
});

module.exports = router;
