const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

// Helper to generate unique complaint ID (CIV-2026-XXXXXX)
async function generateUniqueComplaintId() {
  const count = await Complaint.countDocuments();
  const year = new Date().getFullYear();
  const padded = String(count + 101).padStart(6, '0');
  return `CIV-${year}-${padded}`;
}

// Municipal data-isolation check: an 'authority' (officer) may only act on
// complaints already assigned to their own department. 'admin' (Municipal
// Admin) is not department-restricted. This is enforced here, backend-side,
// so a Department A officer cannot act on Department B's complaint no matter
// what the frontend shows or hides.
function canActOnComplaint(user, complaint) {
  if (user.role === 'admin') return true;
  if (user.role === 'authority') {
    return complaint.assignedDepartment === 'Unassigned' || complaint.assignedDepartment === user.department;
  }
  return false;
}

exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, address, lat, lng, city, area } = req.body;

    if (!title || !description || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide title, description, address, latitude, and longitude' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Run AI analysis
    const aiAnalysisResult = await aiService.analyzeComplaint({
      title,
      description,
      category,
      lat: latitude,
      lng: longitude,
      locationAddress: address
    });

    const complaintId = await generateUniqueComplaintId();

    // Handle image file uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.body.imageUrl) {
      images = Array.isArray(req.body.imageUrl) ? req.body.imageUrl : [req.body.imageUrl];
    } else {
      images = ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'];
    }

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category: aiAnalysisResult.category,
      priority: aiAnalysisResult.priority,
      status: 'REPORTED',
      images,
      location: {
        address,
        lat: latitude,
        lng: longitude,
        city: city || 'Metro City',
        area: area || 'Downtown'
      },
      reportedBy: req.user._id,
      assignedDepartment: aiAnalysisResult.suggestedDepartment,
      aiAnalysis: {
        confidence: aiAnalysisResult.confidence,
        suggestedCategory: aiAnalysisResult.category,
        suggestedPriority: aiAnalysisResult.priority,
        suggestedDepartment: aiAnalysisResult.suggestedDepartment,
        similarCount: aiAnalysisResult.similarCount,
        summary: aiAnalysisResult.summary
      }
    });

    // Create Initial Audit History
    await ComplaintHistory.create({
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      status: 'REPORTED',
      action: 'REPORTED',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      comment: 'Complaint submitted by citizen. AI analysis executed.'
    });

    // Notify Citizen
    await createNotification({
      userId: req.user._id,
      complaintId: complaint.complaintId,
      complaintRef: complaint._id,
      title: 'Complaint Submitted',
      message: `Your complaint ${complaint.complaintId} has been successfully reported and assigned to ${complaint.assignedDepartment}.`,
      type: 'SUBMITTED'
    });

    // Increment user reported count
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.reportedCount': 1 } });

    res.status(201).json({
      success: true,
      complaint,
      aiAnalysis: aiAnalysisResult
    });
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const { category, status, priority, department, search, myComplaints, assignedToMe, area, limit, sort } = req.query;
    
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.assignedDepartment = department;
    if (area) query['location.area'] = new RegExp(area, 'i');

    if (myComplaints === 'true' && req.user) {
      query.reportedBy = req.user._id;
    }

    if (assignedToMe === 'true' && req.user) {
      query.$or = [
        { assignedOfficer: req.user._id },
        { assignedDepartment: req.user.department }
      ];
    }

    if (search) {
      query.$or = [
        { complaintId: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }

    const maxLimit = limit ? parseInt(limit) : 200;
    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const complaints = await Complaint.find(query)
      .sort(sortOption)
      .limit(maxLimit)
      .populate('reportedBy', 'name email role')
      .populate('assignedOfficer', 'name email department');

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email role locationName stats')
      .populate('assignedOfficer', 'name email department phone');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const history = await ComplaintHistory.find({ complaint: complaint._id }).sort({ timestamp: 1 });
    const comments = await Comment.find({ complaint: complaint._id }).populate('user', 'name role department avatar').sort({ createdAt: 1 });
    const feedback = await Feedback.findOne({ complaint: complaint._id }).populate('user', 'name');

    res.status(200).json({
      success: true,
      complaint,
      history,
      comments,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, assignedDepartment, assignedOfficer, estimatedResolutionTime, comment } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role check: Only Authority or Admin can update status
    if (req.user.role !== 'authority' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only authority officers or admins can update complaint status' });
    }

    // Department isolation: an officer outside this complaint's department
    // (and not attempting to claim an Unassigned complaint) is denied.
    if (!canActOnComplaint(req.user, complaint)) {
      return res.status(403).json({ success: false, message: `Officers can only manage complaints assigned to their own department (${req.user.department}).` });
    }

    const oldStatus = complaint.status;

    if (status) complaint.status = status;
    if (assignedDepartment) complaint.assignedDepartment = assignedDepartment;
    if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;
    if (estimatedResolutionTime) complaint.estimatedResolutionTime = new Date(estimatedResolutionTime);

    if (status === 'RESOLVED' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Create Audit History
    await ComplaintHistory.create({
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      status: complaint.status,
      action: status ? `STATUS_CHANGE` : 'UPDATED',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      comment: comment || `Status updated from ${oldStatus} to ${complaint.status}`
    });

    // Send Notification to Reporter
    await createNotification({
      userId: complaint.reportedBy,
      complaintId: complaint.complaintId,
      complaintRef: complaint._id,
      title: `Complaint Status Updated: ${complaint.status}`,
      message: `Your complaint ${complaint.complaintId} status changed to ${complaint.status}. Officer note: "${comment || 'Status updated'}"`,
      type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGE'
    });

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadProofOfWork = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Department isolation, same rule as updateComplaintStatus.
    if (!canActOnComplaint(req.user, complaint)) {
      return res.status(403).json({ success: false, message: `Officers can only upload proof for complaints assigned to their own department (${req.user.department}).` });
    }

    let proofImages = [];
    if (req.files && req.files.length > 0) {
      proofImages = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.body.imageUrl) {
      proofImages = Array.isArray(req.body.imageUrl) ? req.body.imageUrl : [req.body.imageUrl];
    }

    complaint.proofOfWorkImages.push(...proofImages);
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      status: complaint.status,
      action: 'PROOF_UPLOADED',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      comment: req.body.comment || 'Officer uploaded resolution proof photo(s).',
      proofImages
    });

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyResolution = async (req, res, next) => {
  try {
    const { isResolved, feedbackComment, rating } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Only the citizen who reported it can verify
    if (complaint.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the reporting citizen can verify resolution' });
    }

    if (isResolved) {
      complaint.status = 'CLOSED';
      complaint.closedAt = new Date();

      // Record Feedback
      if (rating) {
        await Feedback.create({
          complaint: complaint._id,
          user: req.user._id,
          rating,
          comment: feedbackComment || 'Resolution verified by citizen.',
          isSatisfied: true
        });
      }

      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.resolvedCount': 1 } });
    } else {
      complaint.status = 'REOPENED';
      complaint.reopenReason = feedbackComment || 'Citizen reported issue is not fully resolved.';

      if (rating) {
        await Feedback.create({
          complaint: complaint._id,
          user: req.user._id,
          rating,
          comment: feedbackComment || 'Citizen reopened issue.',
          isSatisfied: false
        });
      }
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      status: complaint.status,
      action: isResolved ? 'CLOSED' : 'REOPENED',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      comment: isResolved 
        ? `Citizen confirmed issue resolution. Rating: ${rating || 5}/5`
        : `Citizen reopened complaint. Feedback: ${feedbackComment}`
    });

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const comment = await Comment.create({
      complaint: complaint._id,
      user: req.user._id,
      message
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name role department avatar');

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    next(error);
  }
};
