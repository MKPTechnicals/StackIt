const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'answer', 'comment', 'mention', 'admin-message'
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: null }, // URL to related resource
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema); 