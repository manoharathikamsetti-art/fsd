import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApplicationRecord, JobDrive } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ManageApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [selectedDrive, setSelectedDrive] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [search, setSearch] = useState('');

  // Status Update Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<ApplicationRecord | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Under Review');
  const [remarks, setRemarks] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAllApplications({
        jobDriveId: selectedDrive !== 'All' ? selectedDrive : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        department: selectedDept !== 'All' ? selectedDept : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch drives for dropdown
    api.getPlacementJobDrives().then((res) => {
      if (res.success) setDrives(res.data || []);
    });
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedDrive, selectedStatus, selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const openStatusModal = (app: ApplicationRecord) => {
    setActiveApp(app);
    setNewStatus(app.status);
    setRemarks('');
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    try {
      setUpdating(true);
      setError(null);
      const res = await api.updateApplicationStatus(activeApp._id, newStatus, remarks);
      if (res.success) {
        setSuccess(`Status updated to "${newStatus}" for student ${activeApp.student?.name || 'Applicant'}`);
        setIsModalOpen(false);
        fetchApplications();
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container">
      <div className="card-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Student Applications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review applicants, verify student external portal confirmations, and update candidate hiring stages.
          </p>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search student name, reg no, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>Drive:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
          >
            <option value="All">All Job Drives</option>
            {drives.map((d) => (
              <option key={d._id} value={d._id}>
                {d.companyName} - {d.jobRole}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>Status:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>Dept:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication">ECE</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading application records...
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No student applications match the query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Details</th>
                <th>CGPA & Dept</th>
                <th>Company & Role</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>External Confirmation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.student?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {app.student?.registrationNumber || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.student?.collegeEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      CGPA: {app.student?.cgpa !== undefined ? app.student.cgpa.toFixed(2) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {app.student?.department || 'Department'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{app.jobDrive?.companyName || app.company?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{app.jobDrive?.jobRole}</div>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    {app.externalPortalConfirmed ? (
                      <span className="badge badge-success">✓ Confirmed</span>
                    ) : (
                      <span className="badge badge-warning">⚠️ Pending</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openStatusModal(app)}
                      className="btn btn-secondary btn-sm"
                    >
                      Update Status →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {isModalOpen && activeApp && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Update Status — {activeApp.student?.name} ({activeApp.student?.registrationNumber})
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Applied Role:</div>
                <div style={{ fontWeight: 600 }}>
                  {activeApp.jobDrive?.companyName} — {activeApp.jobDrive?.jobRole}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newStatus">
                  Application Status
                </label>
                <select
                  id="newStatus"
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected (Placement Offer)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="remarks">
                  Feedback / Remarks for Student
                </label>
                <textarea
                  id="remarks"
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Cleared round 1 technical interview. Technical round 2 scheduled for Wednesday 2 PM."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving Status...' : 'Save & Notify Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
