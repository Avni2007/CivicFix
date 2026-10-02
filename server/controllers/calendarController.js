const CalendarTask = require('../models/CalendarTask');
const Complaint = require('../models/Complaint');

// @desc    Get calendar tasks for authority/admin
// @route   GET /api/calendar
// @access  Private (Authority, Admin)
exports.getCalendarTasks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'authority') {
      query.assignedTo = req.user.id;
    }

    const tasks = await CalendarTask.find(query)
      .populate('complaintId', 'complaintId title category priority status location')
      .sort({ date: 1 });

    // Update overdue status dynamically
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      if (taskObj.status === 'UPCOMING' && new Date(taskObj.deadline) < now) {
        taskObj.status = 'OVERDUE';
      }
      return taskObj;
    });

    res.status(200).json({
      success: true,
      count: updatedTasks.length,
      data: updatedTasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a calendar task / schedule deadline
// @route   POST /api/calendar
// @access  Private (Authority, Admin)
exports.createCalendarTask = async (req, res, next) => {
  try {
    const { complaintId, title, date, deadline, notes } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const task = await CalendarTask.create({
      complaintId,
      assignedTo: req.user.id,
      title: title || `Work on ${complaint.complaintId}: ${complaint.title}`,
      date: new Date(date || Date.now()),
      deadline: new Date(deadline || Date.now() + 86400000 * 3),
      notes: notes || ''
    });

    // Also update complaint estimated resolution time
    complaint.estimatedResolutionTime = new Date(deadline);
    await complaint.save();

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task scheduled successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update calendar task status / details
// @route   PATCH /api/calendar/:id
// @access  Private (Authority, Admin)
exports.updateCalendarTask = async (req, res, next) => {
  try {
    const { status, notes, deadline, date } = req.body;
    let task = await CalendarTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (status) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (deadline) task.deadline = new Date(deadline);
    if (date) task.date = new Date(date);

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete calendar task
// @route   DELETE /api/calendar/:id
// @access  Private (Authority, Admin)
exports.deleteCalendarTask = async (req, res, next) => {
  try {
    await CalendarTask.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Calendar task deleted' });
  } catch (err) {
    next(err);
  }
};
