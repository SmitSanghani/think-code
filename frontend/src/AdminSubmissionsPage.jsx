import React, { useEffect, useMemo, useState } from 'react';

export default function AdminSubmissionsPage({ onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [studentStats, setStudentStats] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  const load = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/submissions');
      if (res.ok) setSubmissions(await res.json());
    } catch (e) { /* no-op */ }
    try {
      const res2 = await fetch('http://localhost:5000/api/stats/students');
      if (res2.ok) setStudentStats(await res2.json());
    } catch (e) { /* no-op */ }
    // Merge local offline submissions
    try {
      const local = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
      if (Array.isArray(local) && local.length) {
        setSubmissions(prev => [...local, ...prev]);
      }
    } catch (_) {}
  };

  const tryDeleteVariants = async (paths) => {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const bases = [
      (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || '',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      origin
    ].filter(Boolean);
    const urls = [];
    paths.forEach(p => { urls.push(p); urls.push(`/api${p.startsWith('/') ? '' : '/'}${p.replace(/^\//,'')}`); });
    bases.forEach(base => {
      paths.forEach(p => { urls.push(`${base}${p}`); urls.push(`${base}/api${p}`); });
    });
    let lastStatus = 0;
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) return true;
        lastStatus = res.status;
      } catch (_) {}
    }
    throw new Error(`Delete failed (${lastStatus || 'network error'})`);
  };

  useEffect(() => { load(); }, []);

  // Group submissions by student email for the left sidebar
  const students = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      const email = s.studentEmail || 'Unknown';
      if (!map.has(email)) map.set(email, []);
      map.get(email).push(s);
    });
    const list = Array.from(map.entries()).map(([email, items]) => ({ email, items }));
    // Sort by email asc
    list.sort((a, b) => a.email.localeCompare(b.email));
    return list;
  }, [submissions]);

  useEffect(() => {
    if (!selectedStudent && students.length) {
      setSelectedStudent(students[0].email);
    }
  }, [students, selectedStudent]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => !selectedStudent || s.studentEmail === selectedStudent);
  }, [submissions, selectedStudent]);

  const getSolvedCount = (email) => {
    const stat = studentStats.find((s) => s.studentEmail === email);
    if (stat) return stat.solvedCount;
    return submissions.filter((x) => x.studentEmail === email && x.isCorrect).length;
  };

  const getAverageGrade = (email) => {
    const nums = submissions
      .filter((x) => x.studentEmail === email && x.grade != null)
      .map((x) => Number(String(x.grade).replace(/[^0-9.]/g, '')))
      .filter((n) => !Number.isNaN(n));
    if (!nums.length) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  };

  const openGrade = (s) => {
    setSelected(s);
    setGrade(s.grade || '');
    setFeedback(s.feedback || '');
  };

  const sendGrade = async () => {
    if (!selected) return;
    try {
      // If this is an offline/local submission, grade locally
      if (selected._localId) {
        const list = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
        const idx = list.findIndex((x) => x._localId === selected._localId);
        if (idx !== -1) {
          list[idx].grade = grade;
          list[idx].feedback = feedback;
          localStorage.setItem('localSubmissions', JSON.stringify(list));
          await load();
          setSelected(null);
          alert('Grade saved (offline)');
          return;
        }
      }

      // Otherwise, send to backend
      const res = await fetch(`http://localhost:5000/api/submissions/${selected._id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, feedback })
      });
      if (res.ok) {
        await load();
        setSelected(null);
      } else {
        // As a fallback, also persist locally if server not reachable
        const list = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
        if (selected._localId) {
          const idx = list.findIndex((x) => x._localId === selected._localId);
          if (idx !== -1) {
            list[idx].grade = grade;
            list[idx].feedback = feedback;
            localStorage.setItem('localSubmissions', JSON.stringify(list));
            await load();
            setSelected(null);
            alert('Grade saved locally');
            return;
          }
        }
        alert('Failed to update grade');
      }
    } catch (e) {
      // Offline/local grading fallback
      try {
        const list = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
        if (selected._localId) {
          const idx = list.findIndex((x) => x._localId === selected._localId);
          if (idx !== -1) {
            list[idx].grade = grade;
            list[idx].feedback = feedback;
            localStorage.setItem('localSubmissions', JSON.stringify(list));
            await load();
            setSelected(null);
            alert('Grade saved (offline)');
            return;
          }
        }
      } catch (_) {}
      alert('Failed to update grade');
    }
  };

  // Removed per-student delete handler

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2vw' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '1.4rem 1.8rem', marginBottom: '1.5rem', boxShadow: '0 6px 28px rgba(30,41,59,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={onBack} style={{ border: 'none', background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)', color: '#fff', padding: '0.6rem 1rem', borderRadius: 10, cursor: 'pointer', fontWeight: 800, boxShadow: '0 2px 8px rgba(59,130,246,0.2)' }}>← Back</button>
            <h2 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Submissions</h2>
          </div>
          {/* Actions removed per request */}
          <div />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem' }}>
          {/* Left: Students list */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, height: 'calc(100vh - 220px)', overflow: 'auto', boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>Students</div>
            {students.map((st) => (
              <div
                key={st.email}
                onClick={() => setSelectedStudent(st.email)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1.5px solid ${selectedStudent === st.email ? '#6366f1' : '#e5e7eb'}`,
                  background: selectedStudent === st.email ? '#eef2ff' : '#fff',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: selectedStudent === st.email ? '0 4px 12px rgba(99,102,241,0.18)' : 'none'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.email}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  {st.items.length} submissions • {getSolvedCount(st.email)} solved • Avg {getAverageGrade(st.email) ?? 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Selected student's submissions */}
          <div>
            {!selectedStudent ? (
              <div style={{ color: '#64748b' }}>Select a student to view and grade submissions.</div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{selectedStudent}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>
                    Total: {filteredSubmissions.length} • Solved: {getSolvedCount(selectedStudent)} • Avg Grade: {getAverageGrade(selectedStudent) ?? 'N/A'}
                  </div>
                </div>

                {submissions && filteredSubmissions.map((s) => (
                  <div key={s._id || s._localId} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.questionTitle}</div>
                        <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(s.submittedAt).toLocaleString()}</div>
                        <div style={{ color: '#0f172a', fontSize: 13 }}>Grade: {s.grade || '—'} {s._localId ? '(Offline)' : ''}</div>
                      </div>
                      <button onClick={() => openGrade(s)} style={{ background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 800 }}>Grade</button>
                    </div>
                    <pre style={{ background: '#0f172a', color: '#a7f3d0', padding: 14, borderRadius: 12, marginTop: 12, overflowX: 'auto' }}>{s.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', width: 760, maxWidth: '95vw', borderRadius: 16, padding: 20, boxShadow: '0 12px 36px rgba(2,6,23,0.28)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Grade Submission</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div><b>Student:</b> {selected.studentEmail}</div>
                <div><b>Question:</b> {selected.questionTitle}</div>
                <div><b>Submitted:</b> {new Date(selected.submittedAt).toLocaleString()}</div>
              </div>
              <div>
                <input placeholder="Grade (0-100)" value={grade} onChange={e => setGrade(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10, background: '#f9fafb' }} />
                <textarea placeholder="Feedback for student" value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }} />
              </div>
            </div>
            <button onClick={sendGrade} style={{ marginTop: 14, background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', fontWeight: 800 }}>Send Grade</button>
            <div style={{ marginTop: 14 }}>
              <b>Student Code</b>
              <pre style={{ background: '#0f172a', color: '#a7f3d0', padding: 14, borderRadius: 12, marginTop: 8, maxHeight: 320, overflow: 'auto' }}>{selected.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


