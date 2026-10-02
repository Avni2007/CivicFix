const express = require('express');
const router = express.Router();
const { getStatistics, getUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/statistics', getStatistics); // Can be called by public/admin dashboard
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
