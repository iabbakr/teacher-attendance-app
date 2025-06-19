import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(false);
  const [isCheckOutEnabled, setIsCheckOutEnabled] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacher(res.data);
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchProfile();

    const now = new Date();
    const hours = now.getHours();
    setIsCheckInEnabled(hours >= 7 && hours < 9);
    setIsCheckOutEnabled(hours >= 13 && hours < 15);
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/attendance/check-in`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Checked in successfully');
    } catch (error) {
      console.error('Check-in error:', error.response?.data);
      alert('Check-in failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/attendance/check-out`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Checked out successfully');
    } catch (error) {
      console.error('Check-out error:', error.response?.data);
      alert('Check-out failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!teacher) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <div>
          <button
            onClick={() => navigate(teacher.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard')}
            className="mr-4 hover:underline"
          >
            Dashboard
          </button>
          <button onClick={() => navigate('/profile')} className="hover:underline">
            Profile
          </button>
        </div>
        <button onClick={handleLogout} className="hover:underline">
          Logout
        </button>
      </nav>
      <div className="flex items-center justify-center py-8">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
          <p>Welcome, {teacher.name}!</p>
          <button
            onClick={handleCheckIn}
            disabled={!isCheckInEnabled}
            className={`w-full p-2 mt-4 ${
              isCheckInEnabled ? 'bg-green-500' : 'bg-gray-400'
            } text-white rounded`}
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckOutEnabled}
            className={`w-full p-2 mt-2 ${
              isCheckOutEnabled ? 'bg-red-500' : 'bg-gray-400'
            } text-white rounded`}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;