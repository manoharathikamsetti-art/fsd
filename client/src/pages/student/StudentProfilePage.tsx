import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { StudentUser } from '../../types';
import { api } from '../../services/api';

export const StudentProfilePage: React.FC = () => {
  const { user, logout, updateStudentInContext } = useAuth();
  const navigate = useNavigate();
  const student = user as StudentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(student?.phone || '');
  const [personalEmail, setPersonalEmail] = useState(student?.personalEmail || '');
  const [profilePicture, setProfilePicture] = useState(student?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.updateStudentProfile({
        phone,
        personalEmail,
        profilePicture,
      });

      if (res.success) {
        updateStudentInContext(res.data);
        setIsEditing(false);
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!student) return null;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Academic & Placement Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Authoritative university credentials and contact information
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            🚪 Log Out
          </button>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {feedback.message}
          </div>
        )}

        {/* Profile Card Header with Picture */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            padding: '24px',
            backgroundColor: 'var(--bg-page)',
            borderRadius: 'var(--radius)',
            marginBottom: '28px',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap',
          }}
        >
          <img
            src={student.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt={student.name}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary-border)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{student.name}</h2>
              <span className="badge badge-primary">{student.role}</span>
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
              Reg No: {student.registrationNumber}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {student.department} • Batch {student.batch}
            </div>
          </div>

          <div
            style={{
              background: 'white',
              padding: '12px 20px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Official CGPA
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              {student.cgpa?.toFixed(2)}
            </div>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSave}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="personalEmail">
                  Personal Email Address
                </label>
                <input
                  id="personalEmail"
                  type="email"
                  className="form-control"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profilePicture">
                Profile Picture URL
              </label>
              <input
                id="profilePicture"
                type="url"
                className="form-control"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* Read-only details view */
          <div>
            <div className="grid grid-2" style={{ marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  College Email (Official)
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{student.collegeEmail}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Personal Email
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{student.personalEmail}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Phone Number
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{student.phone}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Department / Degree
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{student.department}</div>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Registered Technical Skills ({student.skills?.length || 0})
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {student.skills?.map((s) => (
                  <span key={s} className="badge badge-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPhone(student.phone);
                  setPersonalEmail(student.personalEmail);
                  setProfilePicture(student.profilePicture);
                  setIsEditing(true);
                }}
              >
                ✏️ Edit Contact Information
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
