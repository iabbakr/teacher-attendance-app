import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [fingerprint, setFingerprint] = useState(null);

  const handleCheck = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/attendance/check',
        { teacherId: 'teacher_id', fingerprint, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${type} recorded`);
    } catch (error) {
      console.error(error);
      alert('Failed to record attendance');
    }
  };

  const captureFingerprint = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x1234 }] });
      setFingerprint('fingerprint_template');
    } catch (error) {
      console.error('Fingerprint capture failed', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => handleCheck('checkIn')}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={!fingerprint}
        >
          Check In (8 AM)
        </button>
        <button
          onClick={() => handleCheck('checkOut')}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={!fingerprint}
        >
          Check Out (2 PM)
        </button>
        <button onClick={captureFingerprint} className="p-2 bg-blue-500 text-white rounded">
          Capture Fingerprint
        </button>
        <button onClick={() => navigate('/profile')} className="p-2 bg-gray-500 text-white rounded">
          View Profile
        </button>
        <button onClick={() => navigate('/report')} className="p-2 bg-gray-500 text-white rounded">
          View Report
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;