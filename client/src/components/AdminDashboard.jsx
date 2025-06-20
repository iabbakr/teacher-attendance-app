import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [teacherReport, setTeacherReport] = useState(null);
  const [bestPerformance, setBestPerformance] = useState(null);
  const [schoolReport, setSchoolReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

        // Fetch current user
        const userRes = await axios.get(`${apiUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);

        // Fetch all users (teachers and admins)
        const teachersRes = await axios.get(`${apiUrl}/api/auth/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(teachersRes.data.filter(t => t.role === 'teacher'));
        setAdmins(teachersRes.data.filter(t => t.role === 'admin'));
      } catch (error) {
        console.error('Fetch data error:', error.response?.data, error.message);
        setError(error.response?.data?.msg || 'Failed to load data');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const fetchTeacherReport = async (userId, isAdmin = false) => {
    if (!userId) {
      setError(`Please select a ${isAdmin ? 'admin' : 'teacher'}`);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const params = { year, month };
      if (day) params.day = day;
      const res = await axios.get(`${apiUrl}/api/report/teacher/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setTeacherReport(res.data);
      setError('');
    } catch (error) {
      console.error('Teacher report error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const fetchBestPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const params = { year, month };
      if (day) params.day = day;
      const res = await axios.get(`${apiUrl}/api/report/best-performance`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBestPerformance(res.data);
      setError('');
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
      const params = { year, month, schoolName };
      if (day) params.day = day;
      const res = await axios.get(`${apiUrl}/api/report/school`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setSchoolReport(res.data);
      setError('');
    } catch (error) {
      console.error('School report error:', error.response?.data, error.message);
      setError(error.response?.data?.msg || 'Failed to load report');
    }
  };

  const handlePrint = (reportType) => {
    const printWindow = window.open('', '_blank');
    let content = '';
    if (reportType === 'teacher' && teacherReport) {
      content = `
        <html>
          <head>
            <title>${teacherReport.teacher.name} Attendance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h2>${teacherReport.teacher.name} - Attendance Report</h2>
            <p>${day ? `Day: ${day}/` : ''}${month}/${year}</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${teacherReport.report.map(record => `
                  <tr>
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}</td>
                    <td>${record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}</td>
                    <td>${record.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
    } else if (reportType === 'bestPerformance' && bestPerformance) {
      content = `
        <html>
          <head>
            <title>Best Performance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h2>Best Performance Report</h2>
            <p>${day ? `Day: ${day}/` : ''}${month}/${year}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Present Days</th>
                </tr>
              </thead>
              <tbody>
                ${bestPerformance.performance.map(record => `
                  <tr>
                    <td>${record.name}</td>
                    <td>${record.email}</td>
                    <td>${record.presentDays}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
    } else if (reportType === 'school' && schoolReport) {
      content = `
        <html>
          <head>
            <title>${schoolReport.schoolName} Attendance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h2>${schoolReport.schoolName} - Attendance Report</h2>
            <p>${day ? `Day: ${day}/` : ''}${month}/${year}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Present Days</th>
                  <th>Total Records</th>
                </tr>
              </thead>
              <tbody>
                ${schoolReport.report.map(record => `
                  <tr>
                    <td>${record.name}</td>
                    <td>${record.email}</td>
                    <td>${record.presentDays}</td>
                    <td>${record.totalRecords}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
    } else {
      alert('No report available to print');
      return;
    }
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <div>
          <button
            onClick={() => navigate(currentUser?.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard')}
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold my-4">Admin Dashboard</h2>
        <div className="bg-white p-8 rounded shadow-md">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <h3 className="text-xl font-semibold mb-4">Teachers List</h3>
          {teachers.length === 0 ? (
            <p className="text-gray-500">No teachers found</p>
          ) : (
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
          )}
          <h3 className="text-xl font-semibold mb-4">Reports</h3>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Teacher/Admin Attendance Report</h4>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Search Teachers (Name or Email)"
                  className="p-2 border rounded flex-1"
                />
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="p-2 border rounded flex-1"
                >
                  <option value="">Select Teacher</option>
                  {filteredTeachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search Admins (Name or Email)"
                  className="p-2 border rounded flex-1"
                />
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="p-2 border rounded flex-1"
                >
                  <option value="">Select Admin</option>
                  {filteredAdmins.map(admin => (
                    <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Year"
                  className="p-2 border rounded flex-1"
                  min="2020"
                  max="2100"
                />
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="p-2 border rounded flex-1"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="Day (optional)"
                  className="p-2 border rounded flex-1"
                  min="1"
                  max="31"
                />
                <button
                  onClick={() => fetchTeacherReport(selectedTeacherId || selectedAdminId, !!selectedAdminId)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Generate Report
                </button>
                {teacherReport && (
                  <button
                    onClick={() => handlePrint('teacher')}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Print Report
                  </button>
                )}
              </div>
            </div>
            {teacherReport && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{teacherReport.teacher.name} - {day ? `${day}/` : ''}{month}/{year}</h4>
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
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Best Performance Report</h4>
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="p-2 border rounded flex-1"
                min="2020"
                max="2100"
              />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="p-2 border rounded flex-1"
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="Day (optional)"
                className="p-2 border rounded flex-1"
                min="1"
                max="31"
              />
              <button
                onClick={fetchBestPerformance}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Generate Report
              </button>
              {bestPerformance && (
                <button
                  onClick={() => handlePrint('bestPerformance')}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Print Report
                </button>
              )}
            </div>
            {bestPerformance && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold">Best Performance - {day ? `${day}/` : ''}{bestPerformance.month}/{bestPerformance.year}</h4>
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
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">School Attendance Report</h4>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="School Name"
                className="p-2 border rounded flex-1"
              />
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="p-2 border rounded flex-1"
                min="2020"
                max="2100"
              />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="p-2 border rounded flex-1"
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="Day (optional)"
                className="p-2 border rounded flex-1"
                min="1"
                max="31"
              />
              <button
                onClick={fetchSchoolReport}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Generate Report
              </button>
              {schoolReport && (
                <button
                  onClick={() => handlePrint('school')}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Print Report
                </button>
              )}
            </div>
            {schoolReport && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{schoolReport.schoolName} - {day ? `${day}/` : ''}{schoolReport.month}/{schoolReport.year}</h4>
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
          </div>
          <button
            onClick={handleLogout}
            className="w-full p-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;