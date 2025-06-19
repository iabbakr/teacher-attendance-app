import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [position, setPosition] = useState('');
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState('');
  const [subjects, setSubjects] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      console.log('Attempting login to:', `${apiUrl}/api/auth/login`);
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      if (res.data.teacher.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data, error.message);
      alert('Login failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const subjectsArray = subjects.split(',').map(subject => subject.trim()).filter(subject => subject);
      if (subjectsArray.length === 0) {
        alert('Please provide at least one subject');
        return;
      }

      let profilePictureUrl = '';
      if (profilePicture) {
        try {
          const formData = new FormData();
          formData.append('file', profilePicture);
          formData.append('upload_preset', 'teacher_profile');
          const cloudinaryCloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
          if (!cloudinaryCloudName) {
            throw new Error('Cloudinary cloud name is not configured');
          }
          console.log('Uploading to Cloudinary:', `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`);
          const cloudinaryRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
            formData
          );
          profilePictureUrl = cloudinaryRes.data.secure_url;
          console.log('Cloudinary upload successful:', profilePictureUrl);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError.response?.data, cloudinaryError.message);
          alert('Failed to upload profile picture: ' + (cloudinaryError.response?.data?.error?.message || cloudinaryError.message));
          return;
        }
      }

      const payload = {
        name,
        email,
        password,
        age: Number(age),
        schoolName,
        className,
        position,
        gender,
        religion,
        subjects: subjectsArray,
        isAdmin,
        profilePicture: profilePictureUrl
      };
      console.log('Registration payload:', JSON.stringify(payload, null, 2));
      console.log('Sending registration payload to:', `${apiUrl}/api/auth/register`);
      const res = await axios.post(`${apiUrl}/api/auth/register`, payload);
      localStorage.setItem('token', res.data.token);
      navigate(isAdmin ? '/admin-dashboard' : '/teacher-dashboard');
    } catch (error) {
      console.error('Registration error:', error.response?.data, error.message);
      alert('Registration failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      console.log('Sending password reset request for:', resetEmail);
      const res = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email: resetEmail });
      console.log('Password reset response:', res.data);
      alert('Password reset link sent to your email');
      setShowReset(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error.response?.data, error.message);
      alert('Password reset failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Teacher Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
            Login
          </button>
          <p
            className="text-blue-500 text-sm mt-2 cursor-pointer"
            onClick={() => setShowReset(!showReset)}
          >
            Forgot Password?
          </p>
        </form>

        {showReset && (
          <form onSubmit={handleForgotPassword} className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
              Send Reset Link
            </button>
            <button
              type="button"
              className="w-full p-2 mt-2 bg-gray-300 text-black rounded"
              onClick={() => setShowReset(false)}
            >
              Cancel
            </button>
          </form>
        )}

        <button
          className="w-full p-2 mt-4 bg-gray-500 text-white rounded"
          onClick={() => setShowRegister(!showRegister)}
        >
          Enrol Teacher
        </button>

        {showRegister && (
          <form onSubmit={handleRegister} className="mt-4">
            <h3 className="text-xl font-semibold mb-4">Register</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className="w-full p-2 mb-4 border rounded"
              required
              min="18"
            />
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School Name"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class Name"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Position"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              placeholder="Religion"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Subjects (comma-separated)"
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="mr-2"
              />
              Register as Admin
            </label>
            <button type="submit" className="w-full p-2 bg-gray-500 text-white rounded">
              Register
            </button>
            <button
              type="button"
              className="w-full p-2 mt-2 bg-gray-300 text-black rounded"
              onClick={() => setShowRegister(false)}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default TeacherLogin;