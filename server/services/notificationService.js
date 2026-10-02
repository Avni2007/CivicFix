const Notification = require('../models/Notification');

async function createNotification({ userId, complaintId, complaintRef, title, message, type }) {
  if (!userId) return null;
  try {
    const notification = await Notification.create({
      user: userId,
      complaint: complaintRef || null,
      complaintId: complaintId || '',
      title,
      message,
      type: type || 'SYSTEM'
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
}

module.exports = { createNotification };
