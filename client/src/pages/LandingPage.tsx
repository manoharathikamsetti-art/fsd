import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    api
      .checkHealth()
      .then((data) => setHealth(data))
      .catch((err) => setHealth({ error: err.message }))
      .finally(() => setLoadingHealth(false));
  }, []);

  return (
    <div className="container">
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          color: 'white',
          padding: '48px 32px',
          textAlign: 'center',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <span
          className="badge"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            marginBottom: '16px',
            padding: '6px 14px',
          }}
        >
          🚀 Next-Gen Placement Management System
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
          Campus Career & Placement Portal
        </h1>
        <p style={{ fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto 28px', opacity: 0.95 }}>
          Intelligent skills-based job matching, centralized drive management, authoritative database synchronization,
          and end-to-end recruitment tracking for students and placement officers.
        </p>

        {user ? (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {role === 'student' ? (
              <Link to="/student/dashboard" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
                Go to Student Dashboard →
              </Link>
            ) : (
              <Link to="/officer/dashboard" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
                Go to Placement Dashboard →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="btn"
              style={{
                background: 'white',
                color: 'var(--primary)',
                fontWeight: 700,
                padding: '12px 28px',
                fontSize: '1rem',
              }}
            >
              Student Login (Reg. No)
            </Link>
            <Link
              to="/officer/login"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                padding: '12px 28px',
                fontSize: '1rem',
              }}
            >
              Placement Officer Login
            </Link>
          </div>
        )}
      </div>

      {/* System Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '20px 0',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>API Status:</span>
        {loadingHealth ? (
          <span className="badge badge-warning">Checking...</span>
        ) : health?.status === 'ok' ? (
          <span className="badge badge-success">✓ Backend API Online (Port 5000)</span>
        ) : (
          <span className="badge badge-danger">Offline / Unreachable</span>
        )}
        {health?.database && (
          <span className={`badge ${health.database.connected ? 'badge-success' : 'badge-warning'}`}>
            MongoDB: {health.database.state}
          </span>
        )}
      </div>

      {/* Feature Split Cards */}
      <div className="grid grid-2" style={{ marginTop: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '10px',
                  borderRadius: '10px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Student Portal</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Log in with your college registration number to discover verified company drives, manage your technical
              skills, view recommendation rankings based on your skill compatibility, and track application milestones.
            </p>
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '20px' }}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Skills-based recommendation engine
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> CGPA & department eligibility checks
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> External application verification workflow
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Comprehensive profile & skills management
              </li>
            </ul>
          </div>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Access Student Portal →
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  background: '#faf5ff',
                  color: '#7e22ce',
                  padding: '10px',
                  borderRadius: '10px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Placement Officer Portal</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Administrative dashboard for TPO officers to publish company drives, review applications, update selection
              statuses, and analyze placement performance with database-derived aggregation metrics.
            </p>
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '20px' }}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7e22ce', fontWeight: 'bold' }}>✓</span> Real-time derived stats & metrics
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7e22ce', fontWeight: 'bold' }}>✓</span> Dynamic enrolled applicant counts (read-only)
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7e22ce', fontWeight: 'bold' }}>✓</span> Add & edit company/drive information
              </li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7e22ce', fontWeight: 'bold' }}>✓</span> Application status lifecycle management
              </li>
            </ul>
          </div>
          <Link to="/officer/login" className="btn btn-secondary" style={{ width: '100%', borderColor: '#7e22ce', color: '#7e22ce' }}>
            Access Officer Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
