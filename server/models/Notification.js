const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  complaintId: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'STATUS_CHANGE', 'COMMENT', 'RESOLVED', 'REOPENED', 'CLOSED', 'SYSTEM'],
    default: 'SYSTEM'
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
