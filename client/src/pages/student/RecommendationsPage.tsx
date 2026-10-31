import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { RecommendedJobDrive } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedJobDrive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'package'>('match');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await api.getRecommendations();
        if (res.success) {
          setRecommendations(res.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  // Filter & sort
  const filtered = recommendations.filter((job) => {
    if (filterEligibleOnly && !job.isEligible) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCompany = job.companyName.toLowerCase().includes(q);
      const matchRole = job.jobRole.toLowerCase().includes(q);
      const matchSkill = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchCompany && !matchRole && !matchSkill) return false;
    }
    return true;
  });

  if (sortBy === 'package') {
    filtered.sort((a, b) => (b.minPackage || 0) - (a.minPackage || 0));
  } else {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skills-Based Job Recommendations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Opportunities algorithmically ranked by your technical skill compatibility and eligibility
          </p>
        </div>
        <Link to="/student/skills" className="btn btn-secondary btn-sm">
          ⚙️ Edit My Skills
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Bar */}
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
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by role, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary)' }}>Sort by:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="match">Match Score (High to Low)</option>
            <option value="package">Package (High to Low)</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={filterEligibleOnly}
            onChange={(e) => setFilterEligibleOnly(e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>Show Eligible Only (CGPA & Dept)</span>
        </label>
      </div>

      {/* Recommendation Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading personalized job recommendations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>No matching job drives found.</p>
          <p style={{ fontSize: '0.9rem' }}>Try adjusting your search criteria or updating your registered skills.</p>
          <Link to="/student/skills" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            Update My Skills
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filtered.map((job) => {
            const isMatchHigh = job.matchScore >= 70;
            const isMatchMedium = job.matchScore >= 40 && job.matchScore < 70;

            return (
              <div
                key={job._id}
                className="card"
                style={{
                  borderLeft: `5px solid ${isMatchHigh ? 'var(--success)' : isMatchMedium ? 'var(--warning)' : '#94a3b8'}`,
                  marginBottom: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  {/* Left Column: Company & Role */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{job.companyName}</h2>
                      <span className="badge badge-primary">{job.packageRange}</span>
                      {job.applied && (
                        <span style={{ marginLeft: '4px' }}>
                          <StatusBadge status={job.applicationStatus || 'Applied'} />
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
                      {job.jobRole}
                    </div>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.4 }}>
                      {job.description}
                    </p>

                    {/* Eligibility breakdown */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', marginBottom: '16px' }}>
                      <span style={{ color: job.isCgpaEligible ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {job.isCgpaEligible ? '✓' : '✕'} Min CGPA: {job.minCgpa} (Your CGPA: {job.studentCgpa})
                      </span>
                      <span style={{ color: job.isDeptEligible ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {job.isDeptEligible ? '✓' : '✕'} Eligible Branches
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        👥 Intakes: <strong>{job.intakes}</strong>
                      </span>
                    </div>

                    {/* Skills Breakdown */}
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Skills Comparison:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.matchingSkills.map((skill) => (
                          <span key={skill} className="badge badge-skill-match">
                            ✓ {skill}
                          </span>
                        ))}
                        {job.missingSkills.map((skill) => (
                          <span key={skill} className="badge badge-skill-missing">
                            + {skill} (missing)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Match Score Circle & CTA */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '180px',
                      background: 'var(--bg-page)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        border: `4px solid ${isMatchHigh ? 'var(--success)' : isMatchMedium ? 'var(--warning)' : '#94a3b8'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        backgroundColor: 'white',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{job.matchScore}%</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px' }}>
                      Skill Compatibility
                    </span>

                    <Link to={`/student/jobs/${job._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      {job.applied ? 'View Application →' : 'View & Apply →'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
