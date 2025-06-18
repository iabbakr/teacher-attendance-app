import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherProfile() {
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Teacher Profile</h1>
      <div className="bg-white p-4 rounded shadow-md">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default TeacherProfile;