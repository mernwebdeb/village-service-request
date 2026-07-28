import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="nav-brand" onClick={() => navigate('/')}>
          🏘️ Village Service
        </h1>
      </div>

      <div className="nav-center">
        {user?.role === 'citizen' && (
          <>
            <button className="nav-link" onClick={() => navigate('/submit-request')}>
              New Request
            </button>
            <button className="nav-link" onClick={() => navigate('/my-requests')}>
              My Requests
            </button>
            <button className="nav-link" onClick={() => navigate('/history')}>
              History
            </button>
            <button className="nav-link" onClick={() => navigate('/feedback')}>
              Feedback
            </button>
          </>
        )}

        {user?.role === 'official' && (
          <>
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate('/requests')}>
              All Requests
            </button>
            <button className="nav-link" onClick={() => navigate('/activity-log')}>
              Activity Log
            </button>
          </>
        )}
      </div>

      <div className="nav-right">
        <NotificationBell />
        <button className="nav-link" onClick={() => navigate('/preferences')}>
          ⚙️
        </button>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;