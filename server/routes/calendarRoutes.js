const express = require('express');
const router = express.Router();
const {
  getCalendarTasks,
  createCalendarTask,
  updateCalendarTask,
  deleteCalendarTask
} = require('../controllers/calendarController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('authority', 'admin'));

router.get('/', getCalendarTasks);
router.post('/', createCalendarTask);
router.patch('/:id', updateCalendarTask);
router.delete('/:id', deleteCalendarTask);

module.exports = router;
