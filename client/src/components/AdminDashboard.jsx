import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const token = localStorage.getItem('token');
        const [teachersRes, profileRes] = await Promise.all([
          axios.get(`${apiUrl}/api/auth/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setTeachers(teachersRes.data);
        setTeacher(profileRes.data);
      } catch (error) {
        console.error('Data fetch error:', error.response?.data);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchData();
  }, [navigate]);

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
            onClick={() => navigate('/admin-dashboard')}
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
        <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <h3 className="text-lg font-semibold mb-2">Teachers</h3>
          <ul>
            {teachers.map((t) => (
              <li key={t._id} className="mb-2 flex items-center">
                <img
                  src={t.profilePicture}
                  alt={`${t.name}'s profile`}
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
                <span>{t.name} ({t.email}) - {t.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;