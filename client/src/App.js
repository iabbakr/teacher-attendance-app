import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<TeacherLogin />} />
        <Route
          path="/teacher-dashboard"
          element={<ProtectedRoute component={TeacherDashboard} />}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute component={AdminDashboard} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute component={Profile} />}
        />
        <Route path="/" element={<TeacherLogin />} />
      </Routes>
    </Router>
  );
}

export default App;