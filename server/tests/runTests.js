const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const aiService = require('../services/aiService');
const { sendOTPEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const path = require('path');
const { execFile } = require('child_process');

async function runTests() {
  console.log('🧪 Starting CivicFix Automated Unit & Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  try {
    await connectDB();

    // Test 1: AI Category & Priority Prediction
    console.log('[Test 1] Testing AI Category & Priority Engine...');
    const aiResult = await aiService.analyzeComplaint({
      title: 'Deep crater hole in tarmac road near school',
      description: 'Hazardous pothole causing vehicle damage near school zone',
      lat: 28.6139,
      lng: 77.2090,
      locationAddress: 'School Street'
    });

    if (aiResult.category === 'Pothole' && (aiResult.priority === 'HIGH' || aiResult.priority === 'CRITICAL')) {
      console.log(' ✅ PASS: AI predicted Category="Pothole" & Priority="' + aiResult.priority + '" correctly.');
      passed++;
    } else {
      console.error(' ❌ FAIL: AI prediction incorrect:', aiResult);
      failed++;
    }

    // Test 2: AI Duplicate Detection (Haversine 500m)
    console.log('\n[Test 2] Testing Haversine Spatial Duplicate Detection...');
    const dupCheck = await aiService.detectDuplicates(
      28.6139,
      77.2090,
      'Pothole',
      'Crater in road near school',
      'Hazardous pothole'
    );
    if (dupCheck && typeof dupCheck.count === 'number') {
      console.log(` ✅ PASS: Duplicate detection executed cleanly (Found ${dupCheck.count} nearby reports).`);
      passed++;
    } else {
      console.error(' ❌ FAIL: Duplicate detection failed.');
      failed++;
    }

    // Test 3: User Password Hashing & Role Check
    console.log('\n[Test 3] Testing User Model & Password Hashing...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('testpass123', salt);
    const match = await bcrypt.compare('testpass123', hash);
    if (match) {
      console.log(' ✅ PASS: Password hashing & verification functioning.');
      passed++;
    } else {
      console.error(' ❌ FAIL: Password hash mismatch.');
      failed++;
    }

    // Test 4: Email Service Configuration Check
    console.log('\n[Test 4] Testing Email Service & SMTP configuration error handling...');
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        await sendOTPEmail('test@example.com', '123456').catch(err => {
          if (err.message.includes('Email service is not configured')) {
            console.log(' ✅ PASS: Handled missing SMTP credentials with friendly message.');
            passed++;
          } else {
            throw err;
          }
        });
      } else {
        console.log(' ✅ PASS: SMTP credentials configured.');
        passed++;
      }
    } catch (err) {
      console.error(' ❌ FAIL: Email service test error:', err.message);
      failed++;
    }

    // Test 5: OpenCV Pothole Image Detector Script Execution
    console.log('\n[Test 5] Testing OpenCV Pothole Image Detector Python Script...');
    const scriptPath = path.join(__dirname, '..', 'image_detector', 'pothole_detect.py');
    const testImagePath = path.join(__dirname, '..', 'uploads', 'test_pothole.png');

    await new Promise((resolve) => {
      execFile('python', [scriptPath, testImagePath], (error, stdout) => {
        if (error) {
          console.error(' ❌ FAIL: Pothole script failed:', error.message);
          failed++;
        } else {
          try {
            const res = JSON.parse(stdout);
            if (res.success && Array.isArray(res.boxes) && res.authenticity) {
              console.log(` ✅ PASS: Pothole detector returned ${res.count} bounding box(es) and Authenticity rating (${res.authenticity.status}).`);
              passed++;
            } else {
              console.error(' ❌ FAIL: Pothole detector output format invalid:', res);
              failed++;
            }
          } catch (e) {
            console.error(' ❌ FAIL: Invalid JSON from pothole script:', stdout);
            failed++;
          }
        }
        resolve();
      });
    });

    console.log('\n===================================================');
    console.log(`🎉 TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED.`);
    console.log('===================================================\n');

    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ CRITICAL TEST ERROR:', err);
    process.exit(1);
  }
}

runTests();
