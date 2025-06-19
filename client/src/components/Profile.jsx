import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data, error.message);
        alert('Failed to load profile: ' + (error.response?.data?.msg || error.message));
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;
  if (!teacher) return <div>Error loading profile</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <div>
          <button
            onClick={() => navigate(teacher.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard')}
            className="mr-4 hover:underline"
          >
            Back to {teacher.role === 'admin' ? 'Admin' : 'Teacher'} Dashboard
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
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <img
            src={teacher.profilePicture}
            alt={`${teacher.name}'s profile`}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
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
        </div>
      </div>
    </div>
  );
}

export default Profile;