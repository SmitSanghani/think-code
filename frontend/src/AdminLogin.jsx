import React, { useState } from "react";
import API_BASE_URL from "./apiConfig";

export default function AdminLogin({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setError("");
        onLogin();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 16px #0001", minWidth: 350, position: "relative"
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute", top: 10, right: 10, background: "none", border: "none", fontSize: 20, cursor: "pointer"
          }}
        >×</button>
        <h2>Admin Login</h2>
        <div>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button
          type="submit"
          style={{ width: "100%", background: "#e74c3c", color: "#fff", padding: 10, border: "none", borderRadius: 4 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Access Admin Portal"}
        </button>
        <div style={{ color: "red", marginTop: 8, fontSize: 13 }}>Admin Access Only</div>
      </form>
    </div>
  );
}