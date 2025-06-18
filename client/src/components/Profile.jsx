import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your profile');
          navigate('/login');
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTeacher(res.data);
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data, error.message);
        setError(error.response?.data?.msg || 'Failed to load profile');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const fetchMonthlyReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.get(`${apiUrl}/api/report/monthly`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month }
      });
      setReport(res.data);
    } catch (error) {
      console.error('Report fetch error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!teacher) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Teacher Profile</h2>
        <div className="mb-4">
          <p><strong>Name:</strong> {teacher.name}</p>
          <p><strong>Email:</strong> {teacher.email}</p>
          <p><strong>Role:</strong> {teacher.role}</p>
          <p><strong>Age:</strong> {teacher.age}</p>
          <p><strong>School:</strong> {teacher.schoolName}</p>
          <p><strong>Class:</strong> {teacher.className}</p>
          <p><strong>Position:</strong> {teacher.position}</p>
          <p><strong>Gender:</strong> {teacher.gender}</p>
          <p><strong>Religion:</strong> {teacher.religion}</p>
          <p><strong>Subjects:</strong> {teacher.subjects.join(', ')}</p>
          <p><strong>Joined:</strong> {new Date(teacher.createdAt).toLocaleDateString()}</p>
        </div>
        <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
        <div className="mb-4 max-h-40 overflow-y-auto">
          {teacher.attendance.length === 0 ? (
            <p>No attendance records</p>
          ) : (
            teacher.attendance.map((record, index) => (
              <div key={index} className="border-t py-2">
                <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                <p><strong>Check-In:</strong> {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}</p>
                <p><strong>Check-Out:</strong> {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}</p>
              </div>
            ))
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">Monthly Attendance Report</h3>
        <div className="mb-4 flex gap-4">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="p-2 border rounded"
            min="2020"
            max="2100"
          />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={fetchMonthlyReport}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
        {report && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">{report.teacherName} - {report.month}/{report.year}</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Check-In</th>
                  <th className="border p-2">Check-Out</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.report.map((record, index) => (
                  <tr key={index}>
                    <td className="border p-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="border p-2">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}</td>
                    <td className="border p-2">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}</td>
                    <td className="border p-2">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default Profile;