import React, { useState } from "react";
import API_BASE_URL from "./apiConfig";

export default function StudentLogin({ onLogin, onClose, mode: initialMode = 'register' }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(initialMode === 'login' ? 'login' : 'register');

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const makeRequest = async (endpoint, payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: e.message } };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === 'register') {
      if (!name || !username || !email || !phone || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } else {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'register') {
        const regResp = await makeRequest('/registration', { fullName: name, username, email, phone, gender, password, confirmPassword });
        if (regResp.ok) {
          try { sessionStorage.setItem('studentEmail', email); } catch (_) {}
          onLogin({ email, student: { email, name, username }, isTemporarySession: true });
          setLoading(false);
          return;
        }
        if (regResp.status === 409) {
          setError('Email or username already exists. Please switch to Login.');
          setLoading(false);
          return;
        }
        setError(regResp.data?.error || 'Unable to register. Please try again.');
      } else {
        const loginResp = await makeRequest('/students/login', { email, password });
        if (loginResp.ok) {
          try { localStorage.setItem('studentEmail', email); } catch (_) {}
          try { if (loginResp.data?.student?._id) localStorage.setItem('studentId', loginResp.data.student._id); } catch (_) {}
          onLogin({ email, password, student: loginResp.data?.student });
          setLoading(false);
          return;
        }
        setError(loginResp.data?.error || 'Unable to login. Please check your credentials.');
      }
      setLoading(false);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            {mode === 'register' ? 'Student Registration' : 'Student Login'}
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            margin: 0
          }}>
            {mode === 'register' ? 'Create your account to start coding' : 'Enter your credentials to start coding'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.95rem' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.95rem' }}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" style={inputStyle} />
              </div>
            </>
          )}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.border = '2px solid #3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {mode === 'register' && (
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.95rem' }}>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your number" style={inputStyle} />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.border = '2px solid #3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.95rem' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.95rem' }}>Gender</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#374151' }}>
                  <label><input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={(e) => setGender(e.target.value)} /> Male</label>
                  <label><input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={(e) => setGender(e.target.value)} /> Female</label>
                  <label><input type="radio" name="gender" value="Prefer not to say" checked={gender === 'Prefer not to say'} onChange={(e) => setGender(e.target.value)} /> Prefer not to say</label>
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                background: 'white',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.border = '2px solid #cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.border = '2px solid #e2e8f0';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '10px',
                background: '#3b82f6',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) { e.target.style.background = '#2563eb'; e.target.style.transform = 'translateY(-1px)'; }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Please wait…' : (mode === 'register' ? 'Register' : 'Login')}
            </button>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', color: '#64748b' }}>
            {mode === 'register' ? (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ border: 'none', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: 700 }}>Login</button>
              </span>
            ) : (
              <span>
                New here?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); }} style={{ border: 'none', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: 700 }}>Register</button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
