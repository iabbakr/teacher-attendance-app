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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
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
        isAdmin
      };
      console.log('Sending registration payload:', payload);
      const res = await axios.post(`${apiUrl}/api/auth/register`, payload);
      localStorage.setItem('token', res.data.token);
      navigate(isAdmin ? '/admin-dashboard' : '/teacher-dashboard');
    } catch (error) {
      console.error('Registration error:', error.response?.data, error.message);
      alert('Registration failed: ' + (error.response?.data?.msg || error.message));
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
        </form>
        <h3 className="text-xl font-semibold mt-6 mb-4">Register</h3>
        <form onSubmit={handleRegister}>
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
        </form>
      </div>
    </div>
  );
}

export default TeacherLogin;