const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
  reputation: { type: Number, default: 0 },
  profilePicture: { type: String, default: null },
  banned: { type: Boolean, default: false },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); 