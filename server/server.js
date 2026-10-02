const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const draftRoutes = require('./routes/draftRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const municipalityRoutes = require('./routes/municipalityRoutes');

const app = express();

// Trust proxy when deployed behind Render/Railway/Vercel/etc.
app.set('trust proxy', 1);

// Middleware
const allowedOrigin = process.env.CLIENT_URL || true;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'CivicFix API Server',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/municipalities', municipalityRoutes);

// In production, serve the built React SPA from the same Express server.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('================================================');
      console.log(`🚀 CivicFix running on port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      if (require('fs').existsSync(clientDist)) console.log(`🌐 Web: http://localhost:${PORT}`);
      console.log(`✉️ SMTP: ${smtpConfigured ? 'configured' : 'not configured - OTP email delivery is disabled'}`);
      console.log('================================================');
    });
  } catch (error) {
    console.error('[Startup] Database connection failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) startServer();

module.exports = { app, startServer };
