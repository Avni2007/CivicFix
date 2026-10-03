const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'civicfix_production_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const deliverVerificationOTP = async (email, otp, name) => {
  try {
    await sendOTPEmail(email, otp, name);
    return { delivered: true };
  } catch (error) {
    console.warn(`[Auth] SMTP delivery note for ${email}: ${error.message}`);
    console.log(`\n======================================================`);
    console.log(`🔑 [CIVICFIX VERIFICATION OTP] Code for ${email}: ${otp}`);
    console.log(`======================================================\n`);
    return { delivered: false, error: error.message };
  }
};

const deliverResetOTP = async (email, otp, name) => {
  try {
    await sendPasswordResetEmail(email, otp, name);
    return { delivered: true };
  } catch (error) {
    console.warn(`[Auth] SMTP delivery note for ${email}: ${error.message}`);
    console.log(`\n======================================================`);
    console.log(`🔑 [CIVICFIX PASSWORD RESET OTP] Code for ${email}: ${otp}`);
    console.log(`======================================================\n`);
    return { delivered: false, error: error.message };
  }
};

/**
 * Public Citizen Registration
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, locationName } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields: name, email, and password.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpPurpose +otpLastSentAt +otpResendCount');
    
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: 'Email address already registered. Please log in.' });
      } else {
        // Unverified account exists: update password & info, issue fresh OTP
        const salt = await bcrypt.genSalt(10);
        existingUser.passwordHash = await bcrypt.hash(password, salt);
        existingUser.name = name.trim();
        existingUser.phone = phone || '';
        existingUser.locationName = locationName || 'Central City';

        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        existingUser.otpPurpose = 'EMAIL_VERIFICATION';
        existingUser.otpLastSentAt = new Date();
        existingUser.otpResendCount = 0;

        await existingUser.save();
        const delivery = await deliverVerificationOTP(existingUser.email, otp, existingUser.name);

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: existingUser.email,
          message: delivery.delivered
            ? 'Account details updated. Verification OTP sent to your registered email.'
            : `Account details updated. Verification OTP: ${otp} (Email delivery offline/unverified)`,
          devOtp: delivery.delivered ? undefined : otp
        });
      }
    }

    // 3. Create new citizen account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'citizen',
      department: 'None',
      phone: phone || '',
      locationName: locationName || 'Central City',
      isVerified: false,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpPurpose: 'EMAIL_VERIFICATION',
      otpLastSentAt: new Date(),
      otpResendCount: 0
    });

    const delivery = await deliverVerificationOTP(user.email, otp, user.name);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: delivery.delivered
        ? 'Account created. Verification OTP sent to your registered email.'
        : `Account created. Verification OTP: ${otp} (Email delivery offline/unverified)`,
      devOtp: delivery.delivered ? undefined : otp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Registration Email OTP
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpPurpose');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can log in directly.',
        alreadyVerified: true
      });
    }

    if (user.otpPurpose && user.otpPurpose !== 'EMAIL_VERIFICATION') {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose. Please request a new verification OTP.' });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check the 6-digit code sent to your email.' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please click Resend OTP to request a new code.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = 'NONE';
    user.otpResendCount = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now active.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend Email Verification OTP
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpPurpose +otpLastSentAt +otpResendCount');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. You can log in directly.' });
    }

    // Cooldown check: 60 seconds
    const now = Date.now();
    if (user.otpLastSentAt && (now - user.otpLastSentAt.getTime() < 60 * 1000)) {
      const waitSec = Math.ceil((60 * 1000 - (now - user.otpLastSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new OTP.`
      });
    }

    // Limit maximum resend attempts per session
    if (user.otpResendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait a while before requesting again.'
      });
    }

    const newOtp = generateOTP();
    user.otp = newOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.otpPurpose = 'EMAIL_VERIFICATION';
    user.otpLastSentAt = new Date();
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    await user.save();

    const delivery = await deliverVerificationOTP(user.email, newOtp, user.name);

    res.status(200).json({
      success: true,
      message: delivery.delivered
        ? 'A new OTP has been sent to your email address.'
        : `A new OTP has been generated: ${newOtp}`,
      devOtp: delivery.delivered ? undefined : newOtp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Citizen Login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      user.otpPurpose = 'EMAIL_VERIFICATION';
      user.otpLastSentAt = new Date();
      await user.save();

      const delivery = await deliverVerificationOTP(user.email, otp, user.name);

      return res.status(401).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: delivery.delivered
          ? 'Your email is not verified. A new OTP has been sent to your email.'
          : `Your email is not verified. Verification OTP: ${otp}`,
        devOtp: delivery.delivered ? undefined : otp
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation,
        state: user.state,
        municipalityCode: user.municipalityCode,
        governmentIdVerified: user.governmentIdVerified,
        verificationAuthority: user.verificationAuthority,
        phone: user.phone,
        locationName: user.locationName,
        isVerified: true,
        stats: user.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Municipal Staff Login (Officer / Admin)
 */
exports.municipalLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'citizen') {
      return res.status(403).json({ success: false, message: 'This account is not a municipal account. Use the citizen login.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This municipal account has been suspended.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'This municipal account is not active. Contact your Municipal Admin.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation,
        state: user.state,
        municipalityCode: user.municipalityCode,
        governmentIdVerified: user.governmentIdVerified,
        verificationAuthority: user.verificationAuthority,
        phone: user.phone,
        locationName: user.locationName,
        isVerified: true,
        stats: user.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Send Reset OTP
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpPurpose +otpLastSentAt +otpResendCount');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    // Cooldown check (60s)
    const now = Date.now();
    if (user.otpLastSentAt && (now - user.otpLastSentAt.getTime() < 60 * 1000)) {
      const waitSec = Math.ceil((60 * 1000 - (now - user.otpLastSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new password reset code.`
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.otpPurpose = 'PASSWORD_RESET';
    user.otpLastSentAt = new Date();
    await user.save();

    const delivery = await deliverResetOTP(user.email, otp, user.name);

    res.status(200).json({
      success: true,
      email: user.email,
      message: delivery.delivered
        ? 'Password reset OTP has been sent to your email.'
        : `Password reset OTP generated: ${otp}`,
      devOtp: delivery.delivered ? undefined : otp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Forgot Password OTP & Issue Reset Token
 */
exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpPurpose +resetPasswordToken +resetPasswordExpiresAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otpPurpose !== 'PASSWORD_RESET') {
      return res.status(400).json({ success: false, message: 'Invalid OTP request. Please request a new password reset OTP.' });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email.' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new reset code.' });
    }

    // Invalidate OTP and generate secure reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = 'NONE';
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      resetToken,
      message: 'OTP verified successfully. Please enter your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with Verified Token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, password, confirmPassword } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!email || !resetToken || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, reset token, and new password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordToken +resetPasswordExpiresAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset session. Please request a new OTP.' });
    }

    if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Password reset session has expired. Please request a new OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, locationName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (locationName) user.locationName = locationName;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
