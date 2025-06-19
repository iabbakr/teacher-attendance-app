const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    default: 'teacher'
  },
  age: {
    type: Number,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  religion: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  profilePicture: {
    type: String,
    default: 'https://res.cloudinary.com/<your-cloudinary-cloud-name>/image/upload/v1/teacher_profile/default.jpg'
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    }
  }],
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Teacher', TeacherSchema);