const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  email: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);