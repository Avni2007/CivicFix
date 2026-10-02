const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  municipalLogin, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  verifyResetOTP, 
  resetPassword, 
  getMe, 
  updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
// Separate municipal authentication path (officer/admin accounts only).
// There is no corresponding public registration route for municipal roles —
// see server/seed/provisionMunicipalUser.js for account provisioning.
router.post('/municipal-login', municipalLogin);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
