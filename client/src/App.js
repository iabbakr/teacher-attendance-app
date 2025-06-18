import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherProfile from './components/TeacherProfile';
import AttendanceReport from './components/AttendanceReport';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<TeacherLogin />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<TeacherProfile />} />
          <Route path="/report" element={<AttendanceReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;