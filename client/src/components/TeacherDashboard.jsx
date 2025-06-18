import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherDashboard() {
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(false);
  const [isCheckOutEnabled, setIsCheckOutEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Check if current time is within allowed ranges (WAT = UTC+1)
  const updateButtonStates = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 1; // WAT is UTC+1
    setIsCheckInEnabled(hours >= 7 && hours < 9);
    setIsCheckOutEnabled(hours >= 13 && hours < 15);
  };

  useEffect(() => {
    updateButtonStates();
    const interval = setInterval(updateButtonStates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.post(`${apiUrl}/api/attendance/check-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.msg);
    } catch (error) {
      console.error('Check-in error:', error.response?.data, error.message);
      setMessage(error.response?.data?.msg || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.post(`${apiUrl}/api/attendance/check-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.msg);
    } catch (error) {
      console.error('Check-out error:', error.response?.data, error.message);
      setMessage(error.response?.data?.msg || 'Check-out failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
      <div className="bg-white p-8 rounded shadow-md w-96">
        <p className="mb-4">Welcome to your dashboard!</p>
        {message && <p className="mb-4 text-center text-red-500">{message}</p>}
        <button
          onClick={handleCheckIn}
          disabled={!isCheckInEnabled}
          className={`w-full p-2 mb-4 rounded ${
            isCheckInEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Check-In (7 AM - 9 AM)
        </button>
        <button
          onClick={handleCheckOut}
          disabled={!isCheckOutEnabled}
          className={`w-full p-2 mb-4 rounded ${
            isCheckOutEnabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Check-Out (1 PM - 3 PM)
        </button>
        <Link to="/profile" className="block w-full p-2 mb-4 bg-blue-500 text-white text-center rounded hover:bg-blue-600">
          View Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;