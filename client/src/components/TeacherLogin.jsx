import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      if (res.data.teacher.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/register`, {
        name: 'Teacher Name',
        email,
        password,
        fingerprint: fingerprint || 'fingerprint_data', // Replace with actual fingerprint data
      });
      localStorage.setItem('token', res.data.token);
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  const captureFingerprint = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x1234 }] });
      // Simulate fingerprint capture (WebUSB integration required)
      setFingerprint('fingerprint_template');
    } catch (error) {
      console.error('Fingerprint capture failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Teacher Login</h2>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
          />
          <button onClick={captureFingerprint} className="w-full p-2 mb-4 bg-blue-500 text-white rounded">
            Capture Fingerprint
          </button>
          <button onClick={handleLogin} className="w-full p-2 bg-green-500 text-white rounded">
            Login
          </button>
          <button onClick={handleRegister} className="w-full p-2 mt-2 bg-gray-500 text-white rounded">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;