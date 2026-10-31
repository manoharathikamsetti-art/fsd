import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { OfficerUser, DashboardStats } from '../../types';
import { api } from '../../services/api';

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const officer = user as OfficerUser;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 50%, #9333ea 100%)',
          color: 'white',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
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
            🏢 Placement Administration
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome, {officer?.name}</h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {officer?.department} • Employee ID: {officer?.employeeId}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/officer/drives" className="btn" style={{ background: 'white', color: '#7e22ce', fontWeight: 700 }}>
            + Create New Drive
          </Link>
          <Link to="/officer/applications" className="btn" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
            Review Applications
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Database-Derived Key Metric Cards */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
            🏢
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats?.drives.total || 0}</div>
            <div className="stat-label">Total Job Drives ({stats?.drives.active || 0} Active)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            🎓
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats?.students.total || 0}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            📄
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats?.applications.total || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            ✓
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats?.applications.selected || 0}</div>
            <div className="stat-label">Total Placements (Offers)</div>
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Breakdown */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
          Recruitment Pipeline Status Breakdown
        </h2>

        <div className="grid grid-3">
          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Under Review</span>
              <span className="badge badge-info">{stats?.applications.underReview || 0}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Initial screening & profile check</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Shortlisted</span>
              <span className="badge badge-purple">{stats?.applications.shortlisted || 0}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Eligible for technical interviews</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Interview Scheduled</span>
              <span className="badge badge-warning">{stats?.applications.interviewScheduled || 0}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active interview rounds</div>
          </div>
        </div>
      </div>

      {/* Aggregations Grid: Department Analytics & Top Hiring Companies */}
      <div className="grid grid-2">
        {/* Department Stats */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Department-Wise Student Distribution</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Computed via MongoDB Aggregation Pipeline ($group, $avg)
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Calculating department statistics...</p>
          ) : !stats?.departmentStats || stats.departmentStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No student records found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Students</th>
                    <th>Average CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.departmentStats.map((dept) => (
                    <tr key={dept._id}>
                      <td style={{ fontWeight: 600 }}>{dept._id || 'Unassigned'}</td>
                      <td>
                        <span className="badge badge-primary">{dept.totalStudents}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {dept.avgCgpa ? dept.avgCgpa.toFixed(2) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Hiring Companies */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Top Hiring Companies</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Computed via MongoDB Aggregation ($lookup, $project)
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading company engagement...</p>
          ) : !stats?.topCompanies || stats.topCompanies.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No application engagement yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Tier</th>
                    <th>Applications</th>
                    <th>Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCompanies.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.companyName || 'Corporate Partner'}</td>
                      <td>
                        <span className="badge badge-purple">{c.tier || 'Core'}</span>
                      </td>
                      <td>
                        <strong>{c.applicationCount}</strong>
                      </td>
                      <td>
                        <span className="badge badge-success">{c.selectedCount} offers</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
