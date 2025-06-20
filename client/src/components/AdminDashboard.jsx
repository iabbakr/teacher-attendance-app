import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [teacherReport, setTeacherReport] = useState(null);
  const [bestPerformance, setBestPerformance] = useState(null);
  const [schoolReport, setSchoolReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [schoolName, setSchoolName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/auth/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(res.data);
      } catch (error) {
        console.error('Fetch teachers error:', error.response?.data, error.message);
        setError(error.response?.data?.msg || 'Failed to load teachers');
      }
    };

    fetchTeachers();
  }, []);

  const fetchTeacherReport = async () => {
    if (!selectedTeacherId) {
      setError('Please select a teacher');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.get(`${apiUrl}/api/report/teacher/${selectedTeacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month }
      });
      setTeacherReport(res.data);
    } catch (error) {
      console.error('Teacher report error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const fetchBestPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.get(`${apiUrl}/api/report/best-performance`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month }
      });
      setBestPerformance(res.data);
    } catch (error) {
      console.error('Best performance error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const fetchSchoolReport = async () => {
    if (!schoolName) {
      setError('Please enter a school name');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const res = await axios.get(`${apiUrl}/api/report/school`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month, schoolName }
      });
      setSchoolReport(res.data);
    } catch (error) {
      console.error('School report error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className=" min-h-screen bg-gray-100">
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
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <h3 className="text-xl font-semibold mb-4">Teachers List</h3>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">School</th>
                <th className="border p-2">Position</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td className="border p-2">{teacher.name}</td>
                  <td className="border p-2">{teacher.email}</td>
                  <td className="border p-2">{teacher.schoolName}</td>
                  <td className="border p-2">{teacher.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-xl font-semibold mb-4">Teacher Attendance Report</h3>
        <div className="mb-4 flex gap-4">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select Teacher</option>
            {teachers.filter(t => t.role === 'teacher').map(teacher => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>
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
            onClick={fetchTeacherReport}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
        {teacherReport && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">{teacherReport.teacher.name} - {teacherReport.month}/{teacherReport.year}</h4>
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
                {teacherReport.report.map((record, index) => (
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
        <h3 className="text-xl font-semibold mb-4">Best Performance Report</h3>
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
            onClick={fetchBestPerformance}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
        {bestPerformance && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Best Performance - {bestPerformance.month}/{bestPerformance.year}</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Present Days</th>
                </tr>
              </thead>
              <tbody>
                {bestPerformance.performance.map((record, index) => (
                  <tr key={index}>
                    <td className="border p-2">{record.name}</td>
                    <td className="border p-2">{record.email}</td>
                    <td className="border p-2">{record.presentDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h3 className="text-xl font-semibold mb-4">School Attendance Report</h3>
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="School Name"
            className="p-2 border rounded"
          />
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
            onClick={fetchSchoolReport}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
        {schoolReport && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">{schoolReport.schoolName} - {schoolReport.month}/{schoolReport.year}</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Present Days</th>
                  <th className="border p-2">Total Records</th>
                </tr>
              </thead>
              <tbody>
                {schoolReport.report.map((record, index) => (
                  <tr key={index}>
                    <td className="border p-2">{record.name}</td>
                    <td className="border p-2">{record.email}</td>
                    <td className="border p-2">{record.presentDays}</td>
                    <td className="border p-2">{record.totalRecords}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full p-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;