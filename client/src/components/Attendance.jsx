import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Attendance() {
  const [fingerprint, setFingerprint] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/attendance',
        { fingerprint },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Attendance recorded');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to record attendance');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Record Attendance</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Fingerprint (Simulated)</label>
            <input
              type="text"
              value={fingerprint}
              onChange={(e) => setFingerprint(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter fingerprint data"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Submit Attendance
          </button>
        </form>
      </div>
    </div>
  );
}

export default Attendance;