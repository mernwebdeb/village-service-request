import NotificationPreferences from './pages/NotificationPreferences';
import FeedbackHistory from './pages/FeedbackHistory';
import RequestHistory from './pages/RequestHistory';
import Dashboard from './pages/Dashboard';
import RequestDetail from './pages/RequestDetail';
import Register from './pages/Register';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, getUser, getUserRole } from './utils/auth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SubmitRequest from './pages/SubmitRequest';
import MyRequests from './pages/MyRequests';
import RequestList from './pages/RequestList';
import ActivityLogPage from './pages/ActivityLogPage';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const handleLoginSuccess = (user) => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  const HomeRedirect = () => {
    if (!loggedIn) return <Navigate to="/login" replace />;
    const role = getUserRole();
    if (role === 'official') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/my-requests" replace />;
  };

  return (
    <BrowserRouter>
      {loggedIn && <Navbar onLogout={handleLogout} />}

      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/login"
            element={
              loggedIn ? <HomeRedirect /> : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/register"
            element={
              loggedIn ? <HomeRedirect /> : <Register />
            }
          />

          <Route
            path="/submit-request"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['official']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={['official']}>
                <RequestList onRequestClick={(id) => console.log('View request:', id)} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity-log"
            element={
              <ProtectedRoute allowedRoles={['official']}>
                <ActivityLogPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request/:id"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'official']}>
                <RequestDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <RequestHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <FeedbackHistory />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/preferences"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'official']}>
                <NotificationPreferences />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;