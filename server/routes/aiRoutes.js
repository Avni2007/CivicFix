const express = require('express');
const router = express.Router();
const { analyzeIssue, checkDuplicates, detectPothole } = require('../controllers/aiController');
const upload = require('../middleware/upload');

router.post('/analyze', analyzeIssue);
router.post('/duplicate-check', checkDuplicates);
router.post('/detect-pothole', upload.single('image'), detectPothole);

module.exports = router;
