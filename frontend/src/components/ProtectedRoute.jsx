import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(getUserRole())) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;