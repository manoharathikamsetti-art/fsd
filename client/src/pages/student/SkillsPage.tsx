import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Python',
  'Java',
  'SQL',
  'Data Structures',
  'Algorithms',
  'AWS',
  'Docker',
  'Git',
  'REST APIs',
  'System Design',
  'Machine Learning',
  'HTML/CSS',
];

export const SkillsPage: React.FC = () => {
  const { updateStudentInContext } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const res = await api.getStudentSkills();
        if (res.success) {
          setSkills(res.skills || []);
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to load skills.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFeedback({ type: 'error', message: `"${trimmed}" is already in your skills list.` });
      return;
    }

    setSkills([...skills, trimmed]);
    setNewSkill('');
    setFeedback(null);
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(skills[index] || '');
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      handleRemoveSkill(index);
      setEditingIndex(null);
      return;
    }

    const updated = [...skills];
    updated[index] = trimmed;
    setSkills(updated);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSaveSkillsToBackend = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      const res = await api.updateStudentSkills(skills);
      if (res.success) {
        setSkills(res.skills);
        updateStudentInContext({ skills: res.skills });
        setFeedback({
          type: 'success',
          message: 'Skills updated successfully! Your job recommendations have been refreshed.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving skills.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Manage Technical Skills</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your skills are matched against company drive requirements to generate personalized recommendations.
            </p>
          </div>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {feedback.message}
          </div>
        )}

        {/* Add Skill Form */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Type a skill (e.g. React, Python, Docker)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill(newSkill);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAddSkill(newSkill)}
            disabled={!newSkill.trim()}
          >
            + Add Skill
          </button>
        </div>

        {/* Current Skills List */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>
            Your Registered Skills ({skills.length})
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading skills...</p>
          ) : skills.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-page)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              No skills added yet. Click on the suggestions below or type a skill to add.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.map((skill, index) => {
                if (editingIndex === index) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'white',
                        border: '2px solid var(--primary)',
                        borderRadius: '9999px',
                        padding: '4px 10px',
                      }}
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(index);
                          if (e.key === 'Escape') setEditingIndex(null);
                        }}
                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100px' }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(index)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary)',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--secondary)',
                        fontSize: '0.75rem',
                      }}
                      title="Edit skill"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--danger)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Skills Suggestions */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
            Quick Add Popular Technologies:
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {POPULAR_SKILLS.filter(
              (pSkill) => !skills.some((s) => s.toLowerCase() === pSkill.toLowerCase())
            ).map((pSkill) => (
              <button
                key={pSkill}
                type="button"
                onClick={() => handleAddSkill(pSkill)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '9999px', fontSize: '0.8rem', padding: '4px 12px' }}
              >
                + {pSkill}
              </button>
            ))}
          </div>
        </div>

        {/* Save Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSaveSkillsToBackend}
            disabled={saving}
            style={{ minWidth: '160px' }}
          >
            {saving ? 'Saving...' : '💾 Save Skills to Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};
