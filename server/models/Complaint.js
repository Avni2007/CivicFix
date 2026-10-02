const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Garbage', 'Pothole', 'Road', 'Streetlight', 'Water', 'Drainage', 'Public Property', 'Traffic', 'Other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM' 
  },
  status: { 
    type: String, 
    enum: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED'],
    default: 'REPORTED' 
  },
  images: [{ type: String }],
  proofOfWorkImages: [{ type: String }],
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String, default: 'Metro City' },
    area: { type: String, default: 'Downtown' },
    state: { type: String, default: 'National' },
    municipalityCode: { type: String, default: '' }
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDepartment: { 
    type: String, 
    enum: ['Public Works', 'Sanitation', 'Electricity', 'Water', 'Drainage', 'Traffic', 'Municipal Administration', 'Unassigned'],
    default: 'Unassigned' 
  },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  estimatedResolutionTime: { type: Date, default: null },
  aiAnalysis: {
    confidence: { type: Number, default: 0.90 },
    suggestedCategory: { type: String },
    suggestedPriority: { type: String },
    suggestedDepartment: { type: String },
    similarCount: { type: Number, default: 0 },
    summary: { type: String }
  },
  reopenReason: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null }
}, { timestamps: true });

// Add spatial and common search indexes
complaintSchema.index({ category: 1, status: 1, priority: 1 });
complaintSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
