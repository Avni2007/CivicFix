const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER?.replace(/["']/g, '').trim();
  const pass = process.env.SMTP_PASS?.replace(/["'\s]/g, '');

  if (!user || !pass || user.includes('yourgmail@gmail.com') || user.includes('your_gmail_address') || pass.includes('your_gmail_app_password')) {
    return null;
  }

  const isGmail = host.toLowerCase().includes('gmail');
  
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
}

/**
 * Send 6-digit OTP verification email to registered user
 */
async function sendOTPEmail(recipientEmail, otp, userName = 'Citizen') {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email service is not configured. Please configure SMTP_USER and SMTP_PASS with a Gmail App Password in server/.env.');
  }

  const from = process.env.SMTP_FROM || `"CivicFix India" <${process.env.SMTP_USER}>`;
  const greetingName = userName ? userName.trim() : 'Citizen';

  const mailOptions = {
    from,
    to: recipientEmail,
    subject: 'CivicFix Email Verification OTP',
    text: `CivicFix India\n\nHello ${greetingName},\n\nThank you for registering with CivicFix.\n\nYour email verification OTP is:\n${otp}\n\nThis OTP is valid for 10 minutes.\nIf you did not create this account, you can safely ignore this email.\n\nRegards,\nCivicFix Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0284c7; font-size: 24px; font-weight: 800; margin: 0;">CivicFix India</h2>
          <p style="font-size: 12px; color: #64748b; margin-top: 4px;">AI-Powered Municipal Civic Portal</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 16px 0;">Hello <strong>${greetingName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 16px 0;">Thank you for registering with CivicFix.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 16px 0;">Your email verification OTP is:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; background-color: #f0f9ff; border: 2px solid #bae6fd; padding: 14px 28px; border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 16px 0;">This OTP is valid for <strong>10 minutes</strong>. If you did not create this account, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 13px; color: #475569; margin: 8px 0;">Regards,<br /><strong>CivicFix Team</strong></p>
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">CivicFix India Municipal Platform</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP email sent successfully to ${recipientEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send OTP email to ${recipientEmail}:`, error.message);

    if (error.responseCode === 535 || /username and password not accepted/i.test(error.message)) {
      throw new Error('Gmail SMTP authentication failed. A 16-character Gmail App Password is required in server/.env (see https://myaccount.google.com/apppasswords).');
    }

    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

/**
 * Send Password Reset OTP email
 */
async function sendPasswordResetEmail(recipientEmail, otp, userName = 'Citizen') {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email service is not configured. Please configure SMTP_USER and SMTP_PASS with a Gmail App Password in server/.env.');
  }

  const from = process.env.SMTP_FROM || `"CivicFix India" <${process.env.SMTP_USER}>`;
  const greetingName = userName ? userName.trim() : 'Citizen';

  const mailOptions = {
    from,
    to: recipientEmail,
    subject: 'CivicFix Password Reset OTP',
    text: `CivicFix India\n\nHello ${greetingName},\n\nWe received a request to reset your CivicFix account password.\n\nYour password reset OTP is:\n${otp}\n\nThis OTP is valid for 10 minutes.\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nRegards,\nCivicFix Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0284c7; font-size: 24px; font-weight: 800; margin: 0;">CivicFix India</h2>
          <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Account Security</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.5; color: #334155; margin: 16px 0;">Hello <strong>${greetingName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 16px 0;">We received a request to reset your CivicFix account password.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 16px 0;">Your password reset OTP is:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a; background-color: #fef2f2; border: 2px solid #fecaca; padding: 14px 28px; border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 16px 0;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 13px; color: #475569; margin: 8px 0;">Regards,<br /><strong>CivicFix Team</strong></p>
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">CivicFix India Municipal Platform</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset OTP sent to ${recipientEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send reset OTP to ${recipientEmail}:`, error.message);

    if (error.responseCode === 535 || /username and password not accepted/i.test(error.message)) {
      throw new Error('Gmail SMTP authentication failed. A 16-character Gmail App Password is required in server/.env.');
    }

    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail
};
