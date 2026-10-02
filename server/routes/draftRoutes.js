const express = require('express');
const router = express.Router();
const {
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft
} = require('../controllers/draftController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saveDraft);
router.get('/', protect, getDrafts);
router.get('/:id', protect, getDraftById);
router.delete('/:id', protect, deleteDraft);

module.exports = router;
