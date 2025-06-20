const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Get Teacher Attendance Report
router.get('/teacher/:id', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ msg: 'Year and month are required' });
    }

    const teacher = await Teacher.findById(req.params.id).select('name email attendance');
    if (!teacher) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const report = teacher.attendance
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .map(record => ({
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.checkIn ? (record.checkOut ? 'Present' : 'Incomplete') : 'Absent'
      }));

    res.json({
      teacher: { name: teacher.name, email: teacher.email },
      year,
      month,
      report
    });
  } catch (error) {
    console.error('Teacher report error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get Best Performance Report
router.get('/best-performance', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ msg: 'Year and month are required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const teachers = await Teacher.find({ role: 'teacher' }).select('name email attendance');
    const performance = teachers.map(teacher => {
      const presentDays = teacher.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate && record.checkIn && record.checkOut;
      }).length;
      return { name: teacher.name, email: teacher.email, presentDays };
    }).sort((a, b) => b.presentDays - a.presentDays);

    res.json({ year, month, performance });
  } catch (error) {
    console.error('Best performance error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get School Attendance Report
router.get('/school', authMiddleware, async (req, res) => {
  try {
    const { year, month, schoolName } = req.query;
    if (!year || !month || !schoolName) {
      return res.status(400).json({ msg: 'Year, month, and school name are required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const teachers = await Teacher.find({ schoolName, role: 'teacher' }).select('name email attendance');
    const report = teachers.map(teacher => {
      const attendanceRecords = teacher.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
      const presentDays = attendanceRecords.filter(record => record.checkIn && record.checkOut).length;
      return {
        name: teacher.name,
        email: teacher.email,
        presentDays,
        totalRecords: attendanceRecords.length
      };
    });

    res.json({ schoolName, year, month, report });
  } catch (error) {
    console.error('School report error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;