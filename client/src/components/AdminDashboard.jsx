import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/report/admin-report', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-xl mb-2">Comprehensive Attendance Report</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Teacher</th>
            <th className="p-2">Date</th>
            <th className="p-2">Check In</th>
            <th className="p-2">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td className="p-2">{report.teacherId.name}</td>
              <td className="p-2">{new Date(report.date).toLocaleDateString()}</td>
              <td className="p-2">{report.checkIn ? new Date(report.checkIn).toLocaleTimeString() : '-'}</td>
              <td className="p-2">{report.checkOut ? new Date(report.checkOut).toLocaleTimeString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;