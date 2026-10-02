const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  uploadProofOfWork,
  verifyResolution,
  addComment
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or Protected GET
router.get('/', getComplaints);
router.get('/:id', getComplaintById);

// Protected Citizen / General Endpoints
router.post('/', protect, upload.array('images', 5), createComplaint);
router.post('/:id/verify', protect, verifyResolution);
router.post('/:id/comments', protect, addComment);

// Protected Authority / Admin Endpoints
router.patch('/:id', protect, authorize('authority', 'admin'), updateComplaintStatus);
router.post('/:id/proof', protect, authorize('authority', 'admin'), upload.array('proofImages', 5), uploadProofOfWork);

module.exports = router;
