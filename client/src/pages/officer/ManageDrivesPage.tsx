import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { JobDrive } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ManageDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDriveId, setActiveDriveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [description, setDescription] = useState('');
  const [intakes, setIntakes] = useState<number>(10);
  const [packageRange, setPackageRange] = useState('');
  const [minPackage, setMinPackage] = useState<number>(0);
  const [maxPackage, setMaxPackage] = useState<number>(0);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [minCgpa, setMinCgpa] = useState<number>(6.5);
  const [eligibleDepartments, setEligibleDepartments] = useState(
    'Computer Science & Engineering, Information Technology, Electronics & Communication'
  );
  const [status, setStatus] = useState<'Upcoming' | 'Active' | 'Completed' | 'Closed'>('Active');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [deadline, setDeadline] = useState('');

  // Read-only applicant count for the edit modal
  const [modalApplicantCount, setModalApplicantCount] = useState<number>(0);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await api.getPlacementJobDrives({
        status: statusFilter,
        search: search.trim() || undefined,
        department: deptFilter !== 'All' ? deptFilter : undefined,
      });
      if (res.success) {
        setDrives(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching job drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [statusFilter, deptFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrives();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setActiveDriveId(null);
    setCompanyName('');
    setJobRole('');
    setDescription('');
    setIntakes(10);
    setPackageRange('12.0 - 18.0 LPA');
    setMinPackage(12.0);
    setMaxPackage(18.0);
    setRequiredSkills('React, TypeScript, Node.js, MongoDB');
    setMinCgpa(7.0);
    setEligibleDepartments('Computer Science & Engineering, Information Technology');
    setStatus('Active');
    setApplicationUrl('https://careers.example.com');
    setDriveDate('');
    setDeadline('');
    setModalApplicantCount(0);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (drive: JobDrive) => {
    setIsEditing(true);
    setActiveDriveId(drive._id);
    setCompanyName(drive.companyName);
    setJobRole(drive.jobRole);
    setDescription(drive.description);
    setIntakes(drive.intakes);
    setPackageRange(drive.packageRange);
    setMinPackage(drive.minPackage || 0);
    setMaxPackage(drive.maxPackage || 0);
    setRequiredSkills(drive.requiredSkills.join(', '));
    setMinCgpa(drive.minCgpa);
    setEligibleDepartments(drive.eligibleDepartments.join(', '));
    setStatus(drive.status);
    setApplicationUrl(drive.applicationUrl);
    setDriveDate(drive.driveDate ? drive.driveDate.substring(0, 10) : '');
    setDeadline(drive.deadline ? drive.deadline.substring(0, 10) : '');
    // Strictly read-only derived applicant count
    setModalApplicantCount(drive.applicantCount || 0);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        companyName,
        jobRole,
        description,
        intakes: Number(intakes),
        packageRange,
        minPackage: Number(minPackage),
        maxPackage: Number(maxPackage),
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        minCgpa: Number(minCgpa),
        eligibleDepartments: eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean),
        status,
        applicationUrl,
        driveDate: driveDate || undefined,
        deadline: deadline || undefined,
      };

      if (isEditing && activeDriveId) {
        const res = await api.updateJobDrive(activeDriveId, payload);
        if (res.success) {
          setSuccess('Job Drive updated successfully! Student dashboards will reflect this update.');
          setIsModalOpen(false);
          fetchDrives();
        }
      } else {
        const res = await api.createJobDrive(payload);
        if (res.success) {
          setSuccess('New Job Drive published successfully!');
          setIsModalOpen(false);
          fetchDrives();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error saving job drive');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the job drive for "${roleName}"? All associated student application records will also be deleted.`)) {
      return;
    }

    try {
      const res = await api.deleteJobDrive(id);
      if (res.success) {
        setSuccess('Job drive removed successfully.');
        fetchDrives();
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting job drive');
    }
  };

  return (
    <div className="container">
      <div className="card-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Campus Job Drives</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Publish, edit, and track recruitment drives. Enrolled applicant counts are strictly derived from real
            student applications.
          </p>
        </div>
        <button type="button" onClick={openAddModal} className="btn btn-primary">
          + Post New Job Drive
        </button>
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search company, job role, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>Status:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>Branch:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication">ECE</option>
          </select>
        </div>
      </div>

      {/* Drives Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading job drives...
        </div>
      ) : drives.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No job drives match the filters.</p>
          <button type="button" onClick={openAddModal} className="btn btn-primary">
            + Create First Job Drive
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Package Range</th>
                <th>Intakes</th>
                <th>Enrolled Applicants (DB Derived)</th>
                <th>Min CGPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive) => (
                <tr key={drive._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{drive.companyName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{drive.jobRole}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{drive.packageRange}</span>
                  </td>
                  <td>{drive.intakes}</td>
                  <td>
                    {/* Read-only derived applicant count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        👥 {drive.applicantCount || 0}
                      </span>
                      {drive.confirmedExternalCount ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                          ({drive.confirmedExternalCount} confirmed)
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>{drive.minCgpa}</td>
                  <td>
                    <StatusBadge status={drive.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(drive)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Drive"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(drive._id, `${drive.companyName} - ${drive.jobRole}`)}
                        className="btn btn-danger btn-sm"
                        title="Delete Drive"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Drive Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {isEditing ? `Edit Job Drive — ${companyName}` : 'Add New Placement Job Drive'}
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google India"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="jobRole">
                    Job Role
                  </label>
                  <input
                    id="jobRole"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Associate Software Engineer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Job Description & Responsibilities
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="intakes">
                    Intake Count
                  </label>
                  <input
                    id="intakes"
                    type="number"
                    min={1}
                    className="form-control"
                    value={intakes}
                    onChange={(e) => setIntakes(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="packageRange">
                    Package Range
                  </label>
                  <input
                    id="packageRange"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 14.0 - 20.0 LPA"
                    value={packageRange}
                    onChange={(e) => setPackageRange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="minCgpa">
                    Minimum CGPA
                  </label>
                  <input
                    id="minCgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="form-control"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="minPackage">
                    Min Package Numeric (for sorting LPA)
                  </label>
                  <input
                    id="minPackage"
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={minPackage}
                    onChange={(e) => setMinPackage(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maxPackage">
                    Max Package Numeric (LPA)
                  </label>
                  <input
                    id="maxPackage"
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={maxPackage}
                    onChange={(e) => setMaxPackage(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="requiredSkills">
                  Required Skills (comma-separated)
                </label>
                <input
                  id="requiredSkills"
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, TypeScript, Node.js, MongoDB"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Used directly by the student skill recommendation matching algorithm.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="eligibleDepartments">
                  Eligible Branches (comma-separated)
                </label>
                <input
                  id="eligibleDepartments"
                  type="text"
                  className="form-control"
                  value={eligibleDepartments}
                  onChange={(e) => setEligibleDepartments(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="driveStatus">
                    Drive Status
                  </label>
                  <select
                    id="driveStatus"
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="applicationUrl">
                    External Portal URL
                  </label>
                  <input
                    id="applicationUrl"
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="deadline">
                    Application Deadline
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="driveDate">
                    Drive / Interview Date
                  </label>
                  <input
                    id="driveDate"
                    type="date"
                    className="form-control"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Requirement: The number of enrolled applicants must never be manually editable */}
              {isEditing && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius)',
                    marginBottom: '16px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Current Enrolled Applicants (Read-Only Database Record Count):
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {modalApplicantCount} Students
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Note: Enrolled applicant count is computed automatically from actual student applications and
                    cannot be altered manually.
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update Job Drive' : 'Publish Job Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
