import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { JobDrive, StudentUser, ApplicationRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const student = user as StudentUser;

  const [job, setJob] = useState<JobDrive | null>(null);
  const [existingApp, setExistingApp] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Application workflow state
  const [notes, setNotes] = useState('');
  const [externalPortalOpened, setExternalPortalOpened] = useState(false);
  const [confirmedExternal, setConfirmedExternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [jobRes, appsRes] = await Promise.all([
          api.getJobById(id),
          api.getStudentApplications(),
        ]);

        if (jobRes.success) setJob(jobRes.data);
        if (appsRes.success) {
          const matched = (appsRes.data as ApplicationRecord[]).find(
            (a) => (typeof a.jobDrive === 'object' ? a.jobDrive?._id : a.jobDrive) === id
          );
          if (matched) {
            setExistingApp(matched);
            setConfirmedExternal(matched.externalPortalConfirmed);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleOpenExternalPortal = () => {
    if (!job?.applicationUrl) return;
    window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
    setExternalPortalOpened(true);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !job) return;

    if (student.cgpa < job.minCgpa) {
      setError(`Cannot apply: Minimum required CGPA is ${job.minCgpa}, but your CGPA is ${student.cgpa}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.applyToJob(id, {
        notes,
        confirmedExternal,
      });

      if (res.success) {
        setExistingApp(res.data);
        setSuccessMessage('Application successfully recorded in Placement Portal!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmExistingExternal = async () => {
    if (!existingApp) return;
    try {
      setSubmitting(true);
      const res = await api.confirmExternalApplication(existingApp._id);
      if (res.success) {
        setExistingApp(res.data);
        setConfirmedExternal(true);
        setSuccessMessage('External portal submission confirmed!');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading job drive details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  if (!job) return null;

  const isCgpaEligible = student.cgpa >= job.minCgpa;
  const isDeptEligible =
    !job.eligibleDepartments ||
    job.eligibleDepartments.length === 0 ||
    job.eligibleDepartments.some((d) => d.toLowerCase() === student.department.toLowerCase());
  const isEligible = isCgpaEligible && isDeptEligible;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/student/recommendations" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ← Back to Recommendations
        </Link>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Main Drive Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{job.companyName}</h1>
              <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                💰 {job.packageRange}
              </span>
              <StatusBadge status={job.status} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
              {job.jobRole}
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Applicants</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              👥 {job.applicantCount || 0}
            </div>
          </div>
        </div>

        {/* Highlight Grid */}
        <div
          className="grid grid-3"
          style={{
            margin: '24px 0',
            padding: '16px',
            background: 'var(--bg-page)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Intake Count
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job.intakes} Candidates</div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Min. CGPA Required
            </span>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: isCgpaEligible ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {job.minCgpa} (Yours: {student.cgpa})
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Drive Date / Deadline
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling Application'}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Job Description</h3>
          <p style={{ lineHeight: 1.6, color: 'var(--secondary)', whiteSpace: 'pre-line' }}>{job.description}</p>
        </div>

        {/* Required Skills */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Required Technical Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {job.requiredSkills.map((skill) => {
              const hasSkill = student.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`badge ${hasSkill ? 'badge-skill-match' : 'badge-skill-missing'}`}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  {hasSkill ? '✓ ' : '+ '}
                  {skill} {hasSkill ? '(Matches profile)' : '(Not in your profile)'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Eligible Departments */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Eligible Departments</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {job.eligibleDepartments.map((dept) => (
              <span key={dept} className="badge badge-info">
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Application Action Section */}
        <div
          style={{
            borderTop: '2px solid var(--border-color)',
            paddingTop: '24px',
          }}
        >
          {existingApp ? (
            /* Already Applied Card */
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  ✓ You have applied for this position
                </span>
                <StatusBadge status={existingApp.status} />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '12px' }}>
                Applied on {new Date(existingApp.appliedAt).toLocaleDateString()} at{' '}
                {new Date(existingApp.appliedAt).toLocaleTimeString()}
              </p>

              {existingApp.externalPortalConfirmed ? (
                <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                  ✓ External company application portal submission verified on{' '}
                  {existingApp.externalPortalConfirmedAt
                    ? new Date(existingApp.externalPortalConfirmedAt).toLocaleDateString()
                    : 'record'}
                  .
                </div>
              ) : (
                <div style={{ marginTop: '12px', background: 'white', padding: '16px', borderRadius: 'var(--radius)' }}>
                  <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: '8px' }}>
                    ⚠️ External Portal Submission Pending Confirmation
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Did you finish submitting your details on the external company portal? Confirm below so the
                    placement cell can mark your application as complete.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={handleOpenExternalPortal}
                      className="btn btn-secondary btn-sm"
                    >
                      Open Application Portal ↗
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmExistingExternal}
                      className="btn btn-success btn-sm"
                      disabled={submitting}
                    >
                      {submitting ? 'Confirming...' : '✓ Confirm I Submitted External Application'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Application Workflow */
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                Application & External Portal Verification Workflow
              </h3>

              {!isEligible && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <strong>Eligibility Notice:</strong>
                  {!isCgpaEligible && (
                    <div>• Your CGPA ({student.cgpa}) does not meet the minimum requirement ({job.minCgpa}).</div>
                  )}
                  {!isDeptEligible && <div>• Your department is not in the list of eligible branches.</div>}
                </div>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Note: Opening the external portal does not automatically submit your application. You must complete
                submission on the company's portal and confirm it here.
              </p>

              <form onSubmit={handleApply}>
                {/* Step 1: Open external portal */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-page)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '16px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>Step 1: Company Application Portal</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Launch the company's official career portal in a new tab to complete their form.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenExternalPortal}
                    className="btn btn-secondary"
                  >
                    Open Application Portal ↗
                  </button>
                </div>

                {/* Step 2: Confirmation checkbox */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius)',
                      background: externalPortalOpened ? 'var(--info-bg)' : 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={confirmedExternal}
                      onChange={(e) => setConfirmedExternal(e.target.checked)}
                      style={{ marginTop: '3px' }}
                    />
                    <span style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                      <strong>Step 2: External Submission Confirmation</strong>
                      <br />
                      <span style={{ color: 'var(--text-muted)' }}>
                        I confirm that I have visited the company application portal and submitted all required details,
                        resume, and academic credentials.
                      </span>
                    </span>
                  </label>
                </div>

                {/* Optional Student Notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    Additional Notes / Portfolio Link (Optional)
                  </label>
                  <input
                    id="notes"
                    type="text"
                    className="form-control"
                    placeholder="e.g. GitHub portfolio link or application reference number"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                  disabled={submitting || !isEligible}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application to Placement Cell'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
