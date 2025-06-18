import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AttendanceReport() {
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5001/api/report/monthly?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReports();
  }, [month, year]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Monthly Attendance Report</h1>
      <div className="mb-4">
        <label className="mr-2">Month:</label>
        <input
          type="number"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="p-2 border rounded"
          min="1"
          max="12"
        />
        <label className="ml-4 mr-2">Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border rounded"
          min="2000"
          max="2100"
        />
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Check In</th>
            <th className="p-2">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td className="p-2">{new Date(report.date).toLocaleDateString()}</td>
              <td className="p-2">{report.checkIn ? new Date(report.checkIn).toLocaleTimeString() : '-'}</td>
              <td className="p-2">{report.checkOut ? new Date(report.checkOut).toLocaleTimeString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => navigate('/teacher-dashboard')}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default AttendanceReport;