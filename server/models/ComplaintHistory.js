const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  complaintId: { type: String, required: true },
  status: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'REPORTED', 'ASSIGNED', 'STATUS_CHANGE', 'PROOF_UPLOADED', 'RESOLVED', 'REOPENED', 'CLOSED'
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedByName: { type: String, required: true },
  changedByRole: { type: String, required: true },
  comment: { type: String, default: '' },
  proofImages: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
