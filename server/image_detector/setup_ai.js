const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('🤖 CivicFix AI Image Detector Setup & Verification');
console.log('====================================================');

const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

console.log('📁 Models directory verified:', modelsDir);

// Verify python & opencv
try {
  const pythonVersion = execSync('python --version', { encoding: 'utf-8' }).trim();
  console.log('✅ Python available:', pythonVersion);

  const cvCheck = execSync('python -c "import cv2; print(cv2.__version__)"', { encoding: 'utf-8' }).trim();
  console.log('✅ OpenCV available: version', cvCheck);
} catch (err) {
  console.error('⚠️ Python or OpenCV verification warning:', err.message);
}

console.log('✅ CivicFix Pothole AI Engine ready!');
console.log('====================================================');
