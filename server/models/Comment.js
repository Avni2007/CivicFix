const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
