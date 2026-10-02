const mongoose = require('mongoose');

const calendarTaskSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['UPCOMING', 'COMPLETED', 'OVERDUE'],
    default: 'UPCOMING'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

calendarTaskSchema.index({ assignedTo: 1, date: 1, status: 1 });

module.exports = mongoose.model('CalendarTask', calendarTaskSchema);
