const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'authority', 'admin'], 
    default: 'citizen' 
  },
  department: { 
    type: String, 
    enum: ['Public Works', 'Sanitation', 'Electricity', 'Water', 'Drainage', 'Traffic', 'Municipal Administration', 'General', 'None'], 
    default: 'None' 
  },
  phone: { type: String, default: '' },
  locationName: { type: String, default: 'Central City' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  // Municipal-only fields (unused/blank for citizen accounts).
  // Populated by seed/provisionMunicipalUser.js when an authority/admin
  // account is provisioned — never set through public registration.
  employeeId: { type: String, trim: true },
  designation: { type: String, default: '' },
  state: { type: String, default: 'National' },
  municipalityCode: { type: String, default: '' },
  governmentIdVerified: { type: Boolean, default: false },
  verificationAuthority: { type: String, default: '' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  otp: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  otpPurpose: { 
    type: String, 
    enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'NONE'], 
    default: 'NONE', 
    select: false 
  },
  otpLastSentAt: { type: Date, select: false },
  otpResendCount: { type: Number, default: 0, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpiresAt: { type: Date, select: false },
  stats: {
    reportedCount: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Ensure uniqueness only for non-empty string employee IDs so citizen accounts (empty/undefined) never collide
userSchema.index(
  { employeeId: 1 },
  {
    unique: true,
    partialFilterExpression: { employeeId: { $type: 'string', $gt: '' } }
  }
);

module.exports = mongoose.model('User', userSchema);
