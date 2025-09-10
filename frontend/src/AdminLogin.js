import React, { useState } from "react";
import API_BASE_URL from "./apiConfig";

export default function AdminLogin({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        onLogin();
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(120deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.2) 100%)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        background: 'white',
        padding: '2.2rem',
        borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(15,23,42,0.18)',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>A</div>
          <div style={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>ThinkCode Admin</div>
        </div>

        <h2 style={{
          textAlign: 'left',
          margin: '0 0 0.4rem 0',
          color: '#0f172a',
          fontSize: '1.8rem',
          fontWeight: 800
        }}>
          Admin Login
        </h2>
        <p style={{ color: '#64748b', marginTop: 0, marginBottom: '1.5rem' }}>Sign in to manage questions and submissions.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: 700 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                background: '#f9fafb'
              }}
              onFocus={(e) => { e.target.style.border = '1px solid #6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.12)'; e.target.style.background = '#ffffff'; }}
              onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: 700 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                background: '#f9fafb'
              }}
              onFocus={(e) => { e.target.style.border = '1px solid #6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.12)'; e.target.style.background = '#ffffff'; }}
              onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.8rem 1rem',
              borderRadius: 10,
              marginBottom: '1rem',
              fontSize: '0.95rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                background: 'white',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                border: 'none',
                borderRadius: 12,
                background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(99,102,241,0.22)'
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
