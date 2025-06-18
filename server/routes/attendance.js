const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Check if time is within a given range (in WAT)
const isTimeInRange = (startHour, endHour) => {
  const now = new Date();
  const hours = now.getUTCHours() + 1; // WAT is UTC+1
  return hours >= startHour && hours < endHour;
};

// Check-In (7 AM - 9 AM WAT)
router.post('/check-in', authMiddleware, async (req, res) => {
  try {
    if (!isTimeInRange(7, 9)) {
      return res.status(400).json({ msg: 'Check-in is only allowed between 7 AM and 9 AM' });
    }

    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = teacher.attendance.find(record => 
      record.date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    );

    if (attendanceRecord && attendanceRecord.checkIn) {
      return res.status(400).json({ msg: 'Already checked in today' });
    }

    if (!attendanceRecord) {
      teacher.attendance.push({
        date: today,
        checkIn: new Date()
      });
    } else {
      attendanceRecord.checkIn = new Date();
    }

    await teacher.save();
    res.json({ msg: 'Checked in successfully', attendance: teacher.attendance });
  } catch (error) {
    console.error('Check-in error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check-Out (1 PM - 3 PM WAT)
router.post('/check-out', authMiddleware, async (req, res) => {
  try {
    if (!isTimeInRange(13, 15)) {
      return res.status(400).json({ msg: 'Check-out is only allowed between 1 PM and 3 PM' });
    }

    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = teacher.attendance.find(record => 
      record.date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    );

    if (!attendanceRecord || !attendanceRecord.checkIn) {
      return res.status(400).json({ msg: 'Must check in before checking out' });
    }

    if (attendanceRecord.checkOut) {
      return res.status(400).json({ msg: 'Already checked out today' });
    }

    attendanceRecord.checkOut = new Date();
    await teacher.save();
    res.json({ msg: 'Checked out successfully', attendance: teacher.attendance });
  } catch (error) {
    console.error('Check-out error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;