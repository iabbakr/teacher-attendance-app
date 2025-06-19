import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, { password });
      alert('Password reset successful! Please log in.');
      navigate('/');
    } catch (error) {
      console.error('Reset password error:', error.response?.data, error.message);
      alert('Password reset failed: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;