const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/authMiddleware');

// Register Teacher or Admin
router.post('/register', async (req, res) => {
  console.log('Register request body:', req.body);
  const { name, email, password, age, schoolName, className, position, gender, religion, subjects, isAdmin, profilePicture } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!name) missingFields.push('name');
  if (!email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!age || isNaN(age)) missingFields.push('age');
  if (!schoolName) missingFields.push('schoolName');
  if (!className) missingFields.push('className');
  if (!position) missingFields.push('position');
  if (!gender) missingFields.push('gender');
  if (!religion) missingFields.push('religion');
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) missingFields.push('subjects');

  if (missingFields.length > 0) {
    console.log('Validation failed: Missing or invalid fields', missingFields);
    return res.status(400).json({ msg: `Missing or invalid fields: ${missingFields.join(', ')}` });
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
      role: isAdmin ? 'admin' : 'teacher',
      profilePicture: profilePicture || undefined
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

    res.json({ token, teacher: { id: teacher.id, name, email, role: teacher.role, profilePicture: teacher.profilePicture } });
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
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { teacher: { id: teacher.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, teacher: { id: teacher.id, name: teacher.name, email, role: teacher.role, profilePicture: teacher.profilePicture } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request for:', email);
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      console.log('Email not found:', email);
      return res.status(404).json({ msg: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    teacher.resetPasswordToken = resetToken;
    teacher.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await teacher.save();
    console.log('Reset token saved for:', email);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://teacher-attendance-app-client.vercel.app'
      : 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    console.log('Sending reset email to:', email, 'with URL:', resetUrl);
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    console.log('Reset email sent to:', email);

    res.json({ msg: 'Password reset link sent' });
  } catch (error) {
    console.error('Forgot password error:', error.message, error.stack);
    res.status(500).json({ msg: 'Failed to send reset email', error: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    console.log('Reset password request for token:', req.params.token);
    const teacher = await Teacher.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!teacher) {
      console.log('Invalid or expired token:', req.params.token);
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);
    teacher.resetPasswordToken = undefined;
    teacher.resetPasswordExpires = undefined;
    await teacher.save();
    console.log('Password reset successful for:', teacher.email);

    res.json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error.message, error.stack);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get Teacher Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id).select('-password -resetPasswordToken -resetPasswordExpires');
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
    const teachers = await Teacher.find().select('-password -resetPasswordToken -resetPasswordExpires');
    res.json(teachers);
  } catch (error) {
    console.error('Fetch teachers error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;