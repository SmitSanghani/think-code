import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

export default function StudentProfile({ studentEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [serverStats, setServerStats] = useState({ solvedCount: 0, recentGrade: null, submissions: [] });

  const load = async () => {
    setLoading(true);
    try {
      if (studentEmail) {
        const res = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(studentEmail)}/stats`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          setServerStats(data);
        }
      }
    } catch (_) {
      // ignore network errors; we'll still show local stats
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [studentEmail]);

  const localSubmissions = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
      return all.filter((s) => s.studentEmail === studentEmail);
    } catch (_) {
      return [];
    }
  }, [studentEmail]);

  const merged = useMemo(() => {
    const all = [...(serverStats.submissions || []), ...localSubmissions];
    return all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [serverStats, localSubmissions]);

  const totals = useMemo(() => {
    const totalSubmissions = merged.length;
    const correctSubmissions = merged.filter((s) => s.isCorrect).length;
    const numericGrades = merged
      .map((s) => (s.grade != null ? Number(String(s.grade).replace(/[^0-9.]/g, '')) : NaN))
      .filter((n) => !Number.isNaN(n));
    const avgGrade = numericGrades.length ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length) : null;
    const bestGrade = numericGrades.length ? Math.max(...numericGrades) : null;
    return { totalSubmissions, problemsSolved: correctSubmissions, avgGrade, bestGrade };
  }, [merged]);

  const getInitials = (email) => {
    if (!email) return 'ST';
    const local = String(email).split('@')[0].replace(/[^a-zA-Z]/g, '');
    return (local.slice(0, 2) || 'ST').toUpperCase();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '2rem' }}>
        {/* Header Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 24,
              boxShadow: '0 8px 18px rgba(99, 102, 241, 0.25)'
            }}>
              {getInitials(studentEmail)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', letterSpacing: '-0.5px' }}>Student Profile</h2>
                <span style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', padding: '4px 10px', borderRadius: 9999, fontWeight: 700, fontSize: 12 }}>Learner</span>
              </div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>{studentEmail}</div>
            </div>
          </div>
          <button onClick={onBack} style={{
            border: 'none',
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.20)'
          }}>
            ← Back
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Submissions" value={totals.totalSubmissions} icon="📦" />
          <StatCard title="Problems Solved" value={totals.problemsSolved} icon="🏅" />
          <StatCard title="Average Grade" value={totals.avgGrade != null ? `${totals.avgGrade.toFixed(1)}` : 'Pending'} icon="📈" />
          <StatCard title="Best Grade" value={totals.bestGrade != null ? String(totals.bestGrade) : 'Pending'} icon="🏆" />
        </div>

        {/* Submission History */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
          <div style={{ fontWeight: 800, marginBottom: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📜</span>
            <span>Submission History</span>
          </div>
          {loading ? (
            <div style={{ color: '#64748b' }}>Loading…</div>
          ) : merged.length === 0 ? (
            <div style={{ color: '#64748b' }}>No submissions yet. Start solving problems to see your progress!</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {merged.map((s) => {
                const borderColor = s.isCorrect ? '#10b981' : '#ef4444';
                return (
                  <div key={s._id || s._localId} style={{
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderLeft: `4px solid ${borderColor}`,
                    borderRadius: 12,
                    padding: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.questionTitle}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>{new Date(s.submittedAt).toLocaleString()}</div>
                        {(() => {
                          const hasFeedback = typeof s.feedback === 'string' && s.feedback.trim().length > 0;
                          const hasGradeValue = s.grade !== undefined && s.grade !== null && String(s.grade).trim() !== '';
                          if (hasFeedback || hasGradeValue) {
                            return (
                              <div style={{ marginTop: 6, color: '#0f172a' }}>
                                {hasGradeValue && (
                                  <span style={{ fontWeight: 700 }}>Grade:</span>
                                )} {hasGradeValue ? String(s.grade) : '—'}
                                {hasFeedback && (
                                  <div style={{ marginTop: 4, color: '#475569' }}>
                                    <span style={{ fontWeight: 700 }}>Feedback:</span> {s.feedback}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge text={s.isCorrect ? 'Correct' : 'Incorrect'} color={s.isCorrect ? '#10b981' : '#ef4444'} />
                        {(() => {
                          const hasGradeValue = s.grade !== undefined && s.grade !== null && String(s.grade).trim() !== '';
                          const adminGraded = s.isAdminGraded === true || hasGradeValue; // fall back to grade presence for older records
                          const show = adminGraded && hasGradeValue;
                          return <Badge text={show ? `Grade: ${s.grade}` : 'Pending'} color="#3b82f6" />;
                        })()}
                        {s._localId && <Badge text="Offline" color="#f59e0b" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '1.1rem 1.2rem',
      boxShadow: '0 2px 12px rgba(2,6,23,0.04)'
    }}>
      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
        <span style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: 10, padding: '4px 8px' }}>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{ background: `${color}15`, color, border: `1px solid ${color}40`, borderRadius: 20, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>
      {text}
    </span>
  );
}


