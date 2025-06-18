const express = require('express');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Monthly report
router.get('/monthly', authMiddleware, async (req, res) => {
  const { teacherId, month, year } = req.query;
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.find({
      teacherId,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin comprehensive report
router.get('/admin-report', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

  try {
    const attendances = await Attendance.find().populate('teacherId', 'name email');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;