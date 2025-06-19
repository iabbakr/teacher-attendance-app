import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
        setIsAdmin(res.data.role === 'admin');
      } catch (error) {
        console.error('Auth check error:', error.response?.data, error.message);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/teacher-dashboard" replace />;

  return children;
};

export default ProtectedRoute;