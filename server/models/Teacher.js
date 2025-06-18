const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fingerprint: { type: String, required: true }, // Store fingerprint template (base64 or hash)
  role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Teacher', teacherSchema);