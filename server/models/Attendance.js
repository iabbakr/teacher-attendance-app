const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
});

module.exports = mongoose.model('Attendance', attendanceSchema);