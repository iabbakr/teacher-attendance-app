const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Register Teacher or Admin
router.post('/register', async (req, res) => {
  console.log('Register request body:', req.body);
  const { name, email, password, age, schoolName, className, position, gender, religion, subjects, isAdmin } = req.body;

  // Validate required fields
  if (!name || !email || !password || !age || !schoolName || !className || !position || !gender || !religion || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    console.log('Validation failed: Missing or invalid fields', { name, email, password, age, schoolName, className, position, gender, religion, subjects });
    return res.status(400).json({ msg: 'All fields are required, and subjects must be a non-empty array' });
  }

  try {
    // Check for existing teacher
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      console.log('Teacher already exists:', email);
      return res.status(400).json({ msg: 'Teacher already exists' });
    }

    // Create new teacher
    teacher = new Teacher({
      name,
      email,
      password,
      age: Number(age),
      schoolName,
      className,
      position,
      gender,
      religion,
      subjects,
      role: isAdmin ? 'admin' : 'teacher'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);

    // Save teacher
    await teacher.save();
    console.log('Teacher saved successfully:', teacher._id);

    // Generate JWT
    const payload = { teacher: { id: teacher.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, teacher: { id: teacher.id, name, email, role: teacher.role } });
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Login Teacher
router.post('/login', async (req, res) => {
  console.log('Login request:', req.body);
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!teacher) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { teacher: { id: teacher.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, teacher: { id: teacher.id, name: teacher.name, email, role: teacher.role } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get Teacher Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id).select('-password');
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get All Teachers (Admin Only)
router.get('/teachers', authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id);
    if (teacher.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const teachers = await Teacher.find().select('-password');
    res.json(teachers);
  } catch (error) {
    console.error('Fetch teachers error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;