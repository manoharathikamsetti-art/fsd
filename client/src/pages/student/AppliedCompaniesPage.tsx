import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { ApplicationRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AppliedCompaniesPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedTimelineApp, setSelectedTimelineApp] = useState<ApplicationRecord | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentApplications();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching applied companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleConfirmExternal = async (appId: string) => {
    try {
      setConfirmingId(appId);
      const res = await api.confirmExternalApplication(appId);
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, externalPortalConfirmed: true } : app))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Error confirming external submission');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="container">
      <div className="card-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Applied Companies & Progress</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Monitor your application statuses, review remarks from the placement cell, and confirm external portal
            submissions.
          </p>
        </div>
        <Link to="/student/recommendations" className="btn btn-primary btn-sm">
          + Explore More Drives
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading your applied companies...
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📂</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Applications Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            You haven't submitted any job drive applications yet.
          </p>
          <Link to="/student/recommendations" className="btn btn-primary">
            View Job Recommendations
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Package Range</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>External Portal Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const companyName = app.company?.name || app.jobDrive?.companyName || 'Company';
                const role = app.jobDrive?.jobRole || 'Software Engineer';
                const pkg = app.jobDrive?.packageRange || 'Competitive';
                const appliedDate = new Date(app.appliedAt).toLocaleDateString();

                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{companyName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{role}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{pkg}</span>
                    </td>
                    <td>{appliedDate}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      {app.externalPortalConfirmed ? (
                        <span className="badge badge-success" title="External portal submission confirmed">
                          ✓ Confirmed
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-warning">⚠️ Pending</span>
                          <button
                            type="button"
                            onClick={() => handleConfirmExternal(app._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            disabled={confirmingId === app._id}
                          >
                            {confirmingId === app._id ? 'Saving...' : 'Confirm'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedTimelineApp(app)}
                        className="btn btn-secondary btn-sm"
                      >
                        Timeline / Remarks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Modal */}
      {selectedTimelineApp && (
        <div className="modal-overlay" onClick={() => setSelectedTimelineApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Application History — {selectedTimelineApp.company?.name || selectedTimelineApp.jobDrive?.companyName}
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedTimelineApp(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Status:</div>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status={selectedTimelineApp.status} />
              </div>
            </div>

            {selectedTimelineApp.notes && (
              <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-page)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Application Notes:</div>
                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{selectedTimelineApp.notes}</div>
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '16px 0 10px' }}>Milestone History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedTimelineApp.statusHistory?.map((hist, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: '3px solid var(--primary)',
                    paddingLeft: '12px',
                    paddingBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={hist.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(hist.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {hist.remarks && (
                    <div style={{ fontSize: '0.875rem', marginTop: '4px', color: 'var(--secondary)' }}>
                      {hist.remarks}
                    </div>
                  )}
                  {hist.updatedBy && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {hist.updatedBy}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTimelineApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
