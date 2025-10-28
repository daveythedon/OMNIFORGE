/**
 * Notification Helper Utilities
 */

const { Notification } = require('../models');

/**
 * Create and emit notification
 */
async function createNotification(userId, notificationData, io) {
  const notification = await Notification.create({
    userId,
    ...notificationData
  });

  // Emit real-time notification if io provided
  if (io) {
    io.to(`company-${userId}`).emit('new-notification', notification);
  }

  return notification;
}

module.exports = {
  createNotification
};
