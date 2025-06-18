const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const router = express.Router();

// Register (enroll) teacher
router.post('/register', async (req, res) => {
  const { name, email, password, fingerprint } = req.body;
  try {
    let teacher = await Teacher.findOne({ email });
    if (teacher) return res.status(400).json({ msg: 'Teacher already exists' });

    teacher = new Teacher({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      fingerprint, // Assume fingerprint is sent as a base64 string or hash
    });

    await teacher.save();

    const token = jwt.sign({ id: teacher._id, role: teacher.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, teacher: { id: teacher._id, name, email, role: teacher.role } });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id, role: teacher.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, teacher: { id: teacher._id, name: teacher.name, email, role: teacher.role } });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;