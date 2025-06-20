const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Get Teacher/Admin Attendance Report
router.get('/teacher/:id', authMiddleware, async (req, res) => {
  try {
    const { year, month, day } = req.query;
    if (!year) {
      return res.status(400).json({ msg: 'Year is required' });
    }

    const teacher = await Teacher.findById(req.params.id).select('name email attendance');
    if (!teacher) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let startDate, endDate;
    if (day && month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59);
    } else if (month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
    } else {
      startDate = new Date(parseInt(year), 0, 1);
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
    }

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
      month: month || '',
      day: day || '',
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
    const { year, month, day } = req.query;
    if (!year) {
      return res.status(400).json({ msg: 'Year is required' });
    }

    let startDate, endDate;
    if (day && month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59);
    } else if (month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
    } else {
      startDate = new Date(parseInt(year), 0, 1);
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
    }

    const teachers = await Teacher.find({ role: 'teacher' }).select('name email attendance');
    const performance = teachers.map(teacher => {
      const presentDays = teacher.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate && record.checkIn && record.checkOut;
      }).length;
      return { name: teacher.name, email: teacher.email, presentDays };
    }).sort((a, b) => b.presentDays - a.presentDays);

    res.json({ year, month: month || '', day: day || '', performance });
  } catch (error) {
    console.error('Best performance error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get School Attendance Report
router.get('/school', authMiddleware, async (req, res) => {
  try {
    const { year, month, day, schoolName } = req.query;
    if (!year || !schoolName) {
      return res.status(400).json({ msg: 'Year and school name are required' });
    }

    let startDate, endDate;
    if (day && month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59);
    } else if (month) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
    } else {
      startDate = new Date(parseInt(year), 0, 1);
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
    }

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

    res.json({ schoolName, year, month: month || '', day: day || '', report });
  } catch (error) {
    console.error('School report error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;