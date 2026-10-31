import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { StudentUser, OfficerUser } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStudent = role === 'student';
  const isOfficer = role === 'placement_officer';
  const student = isStudent ? (user as StudentUser) : null;
  const officer = isOfficer ? (user as OfficerUser) : null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span>PlacementPro</span>
        </Link>

        <ul className="nav-links">
          {isStudent && (
            <>
              <li>
                <NavLink to="/student/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/student/recommendations" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Job Recommendations
                </NavLink>
              </li>
              <li>
                <NavLink to="/student/skills" className={({ isActive }) => (isActive ? 'active' : '')}>
                  My Skills
                </NavLink>
              </li>
              <li>
                <NavLink to="/student/applied" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Applied Companies
                </NavLink>
              </li>
              <li>
                <NavLink to="/student/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Profile
                </NavLink>
              </li>
            </>
          )}

          {isOfficer && (
            <>
              <li>
                <NavLink to="/officer/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Overview & Stats
                </NavLink>
              </li>
              <li>
                <NavLink to="/officer/drives" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Manage Job Drives
                </NavLink>
              </li>
              <li>
                <NavLink to="/officer/applications" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Student Applications
                </NavLink>
              </li>
            </>
          )}

          {!user && (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Student Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/officer/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Placement Officer Login
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {user && (
          <div className="nav-profile">
            {isStudent && student && (
              <Link to="/student/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img
                  src={student.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt={student.name}
                  className="nav-avatar"
                />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.registrationNumber}</div>
                </div>
              </Link>
            )}

            {isOfficer && officer && (
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{officer.name}</div>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Placement Cell</span>
              </div>
            )}

            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
