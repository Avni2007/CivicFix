const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: 'Other' },
  priority: { type: String, default: 'MEDIUM' },
  location: {
    address: { type: String, default: '' },
    lat: { type: Number, default: 30.7333 },
    lng: { type: Number, default: 76.7794 }
  },
  images: [{ type: String }],
  lastSavedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Draft', draftSchema);
