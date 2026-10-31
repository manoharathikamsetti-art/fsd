import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading session details...</p>
      </div>
    );
  }

  if (!user || !role) {
    if (allowedRoles.includes('placement_officer')) {
      return <Navigate to="/officer/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    if (role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/officer/dashboard" replace />;
  }

  return children;
};
