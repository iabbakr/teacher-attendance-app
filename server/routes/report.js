const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Get Monthly Attendance Report (Teacher)
router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ msg: 'Year and month are required' });
    }

    const teacher = await Teacher.findById(req.teacher.id).select('attendance name');
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = teacher.attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const report = records.map(record => ({
      date: record.date,
      checkIn: record.checkIn ? record.checkIn : null,
      checkOut: record.checkOut ? record.checkOut : null,
      status: record.checkIn && record.checkOut ? 'Present' : record.checkIn ? 'Incomplete' : 'Absent'
    }));

    res.json({ teacherName: teacher.name, year, month, report });
  } catch (error) {
    console.error('Monthly report error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Individual Teacher Report (Admin)
router.get('/teacher/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await Teacher.findById(req.teacher.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ msg: 'Year and month are required' });
    }

    const teacher = await Teacher.findById(req.params.id).select('-password');
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = teacher.attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const report = records.map(record => ({
      date: record.date,
      checkIn: record.checkIn ? record.checkIn : null,
      checkOut: record.checkOut ? record.checkOut : null,
      status: record.checkIn && record.checkOut ? 'Present' : record.checkIn ? 'Incomplete' : 'Absent'
    }));

    res.json({ teacher, year, month, report });
  } catch (error) {
    console.error('Teacher report error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Best Performance Report (Admin)
router.get('/best-performance', authMiddleware, async (req, res) => {
  try {
    const admin = await Teacher.findById(req.teacher.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ msg: 'Year and month are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const teachers = await Teacher.find({ role: 'teacher' }).select('name email attendance');
    const performance = teachers.map(teacher => {
      const records = teacher.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const presentDays = records.filter(record => record.checkIn && record.checkOut).length;
      return { name: teacher.name, email: teacher.email, presentDays };
    });

    const sortedPerformance = performance.sort((a, b) => b.presentDays - a.presentDays);
    res.json({ year, month, performance: sortedPerformance });
  } catch (error) {
    console.error('Best performance report error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Overall School Report (Admin)
router.get('/school', authMiddleware, async (req, res) => {
  try {
    const admin = await Teacher.findById(req.teacher.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { year, month, schoolName } = req.query;
    if (!year || !month || !schoolName) {
      return res.status(400).json({ msg: 'Year, month, and schoolName are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const teachers = await Teacher.find({ schoolName, role: 'teacher' }).select('name email attendance');
    const report = teachers.map(teacher => {
      const records = teacher.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const presentDays = records.filter(record => record.checkIn && record.checkOut).length;
      return { name: teacher.name, email: teacher.email, presentDays, totalRecords: records.length };
    });

    res.json({ schoolName, year, month, report });
  } catch (error) {
    console.error('School report error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;