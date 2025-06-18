const express = require('express');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Record check-in/check-out (fingerprint-based)
router.post('/check', authMiddleware, async (req, res) => {
  const { teacherId, fingerprint, type } = req.body; // type: 'checkIn' or 'checkOut'
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ teacherId, date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } });

    if (!attendance) {
      attendance = new Attendance({ teacherId, date: today });
    }

    const now = new Date();
    const hour = now.getHours();
    if (type === 'checkIn' && hour >= 7 && hour <= 9) {
      attendance.checkIn = now;
    } else if (type === 'checkOut' && hour >= 13 && hour <= 15) {
      attendance.checkOut = now;
    } else {
      return res.status(400).json({ msg: 'Invalid check-in/check-out time' });
    }

    await attendance.save();
    res.json({ msg: `${type} recorded` });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;