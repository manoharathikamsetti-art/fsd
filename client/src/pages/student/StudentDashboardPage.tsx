import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { StudentUser, RecommendedJobDrive, ApplicationRecord } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const student = user as StudentUser;

  const [recommendations, setRecommendations] = useState<RecommendedJobDrive[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recRes, appRes] = await Promise.all([
          api.getRecommendations(),
          api.getStudentApplications(),
        ]);
        if (recRes.success) setRecommendations(recRes.data || []);
        if (appRes.success) setApplications(appRes.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApplied = applications.length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const pendingConfirmation = applications.filter((a) => !a.externalPortalConfirmed).length;

  return (
    <div className="container">
      {/* Welcome Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={student?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
            alt={student?.name}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255, 255, 255, 0.4)',
            }}
          />
          <div>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                marginBottom: '6px',
              }}
            >
              🎓 Student Portal
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {student?.name}!</h1>
            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
              {student?.registrationNumber} • {student?.department} • Batch {student?.batch}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Current CGPA</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{student?.cgpa?.toFixed(2)}</div>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Skills Registered</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{student?.skills?.length || 0}</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            📝
          </div>
          <div>
            <div className="stat-val">{totalApplied}</div>
            <div className="stat-label">Total Applied</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
            ★
          </div>
          <div>
            <div className="stat-val">{shortlistedCount}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            ✓
          </div>
          <div>
            <div className="stat-val">{selectedCount}</div>
            <div className="stat-label">Offers / Selected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            ⚠️
          </div>
          <div>
            <div className="stat-val">{pendingConfirmation}</div>
            <div className="stat-label">Pending External Confirm</div>
          </div>
        </div>
      </div>

      {/* Skills banner reminder if skills are empty */}
      {(!student?.skills || student.skills.length === 0) && (
        <div className="alert alert-info">
          <div>
            <strong>Enhance your job recommendations!</strong>
            <p style={{ marginTop: '4px' }}>
              You haven't added any skills to your profile yet. Add your programming languages, frameworks, and technical
              skills to see tailored recommendations.
            </p>
          </div>
          <Link to="/student/skills" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Add Skills Now →
          </Link>
        </div>
      )}

      {/* Main Grid: Recommended Jobs & Recent Applications */}
      <div className="grid grid-2">
        {/* Recommended Drives */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Recommended Drives</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ranked by your skills match score and eligibility
              </p>
            </div>
            <Link to="/student/recommendations" className="btn btn-secondary btn-sm">
              View All ({recommendations.length})
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No active job drives currently available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recommendations.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{job.companyName}</span>
                      <span className="badge badge-primary">{job.packageRange}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '8px' }}>
                      {job.jobRole}
                    </div>

                    {/* Match Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar-container" style={{ width: '120px', margin: 0 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${job.matchScore}%`,
                            backgroundColor: job.matchScore >= 70 ? 'var(--success)' : 'var(--warning)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{job.matchScore}% Skill Match</span>
                    </div>
                  </div>

                  <div>
                    <Link to={`/student/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Applications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track your recruitment process</p>
            </div>
            <Link to="/student/applied" className="btn btn-secondary btn-sm">
              View All ({applications.length})
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading applications...</p>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <p>You haven't applied to any job drives yet.</p>
              <Link to="/student/recommendations" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Explore Opportunities
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.company?.name || app.jobDrive?.companyName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {app.jobDrive?.jobRole} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={app.status} />
                    {!app.externalPortalConfirmed && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '4px' }}>
                        ⚠️ External confirm pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
