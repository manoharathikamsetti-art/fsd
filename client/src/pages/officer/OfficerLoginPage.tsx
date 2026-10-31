import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OfficerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginOfficer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginOfficer(email.trim(), password);
      navigate('/officer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('placement@college.edu');
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '40px' }}>
      <div className="card" style={{ padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#faf5ff',
              color: '#7e22ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Placement Officer Login</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Administrative portal for Training & Placement Cell officers
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="officerEmail">
              Officer Email Address
            </label>
            <input
              id="officerEmail"
              type="email"
              className="form-control"
              placeholder="placement@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="officerPassword">
              Password
            </label>
            <input
              id="officerPassword"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Placement Officer'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            🔑 Fill Demo Officer (placement@college.edu / Password@123)
          </button>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Are you a student?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Student Login →
          </Link>
        </div>
      </div>
    </div>
  );
};
