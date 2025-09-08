import React from "react";

export default function ThinkCodeHomePage({ onAdminClick, onStartCoding }) {
  return (
    <div>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 3rem",
          background: "135deg, #84ffd6ff, hsla(194, 100%, 73%, 0.51)",
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#3b82f6", fontSize: "2rem" }}>{">_"}</span>
          <span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
            ThinkCode
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#" style={{ color: "#222", textDecoration: "none" }}>
            Features
          </a>
          <a href="#" style={{ color: "#222", textDecoration: "none" }}>
            Problems
          </a>
          <a href="#" style={{ color: "#222", textDecoration: "none" }}>
            About
          </a>
          <span style={{ color: "#222", fontWeight: "500" }}>
            <span role="img" aria-label="crown">
              👑
            </span>{" "}
            Admin
          </span>
          <button
            style={{
              border: "1px solid #ef4444",
              color: "#ef4444",
              background: "white",
              borderRadius: "6px",
              padding: "0.5rem 1.2rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: "center", margin: "4rem 0 2rem 0" }}>
        <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#6366f1" }}>
          <span style={{ color: "#3b82f6" }}>{">_"}</span> Think
          <span style={{ color: "#a855f7" }}>Code</span>
        </div>
        <p style={{ color: "#555", fontSize: "1.2rem", margin: "1.5rem 0" }}>
          Master coding interviews with our comprehensive platform. Practice
          problems, get instant feedback,
          <br />
          and track your progress with our in-browser compiler.
        </p>
        <div style={{ margin: "2rem 0" }}>
          <button
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.8rem 2rem",
              fontWeight: "bold",
              fontSize: "1rem",
              marginRight: "1rem",
              cursor: "pointer",
            }}
            onClick={onStartCoding}
          >
            Start Coding
          </button>
          <button
            style={{
              background: "white",
              color: "#ef4444",
              border: "1.5px solid #ef4444",
              borderRadius: "6px",
              padding: "0.8rem 2rem",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={onAdminClick}
          >
            Admin Portal
          </button>
        </div>
      </section>

      {/* Why Choose Section */}
      <section style={{ textAlign: "center", margin: "3rem 0" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "2rem" }}>
          Why Choose ThinkCode?
        </h2>
        <p style={{ color: "#555", margin: "1rem 0 2.5rem 0" }}>
          Our platform provides everything you need to excel in coding
          interviews
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 12px #e0e7ef33",
              padding: "2rem",
              width: "300px",
            }}
          >
            <div
              style={{
                background: "#dbeafe",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
              }}
            >
              <span style={{ fontSize: "1.5rem", color: "#3b82f6" }}>
                {"<>"}
              </span>
            </div>
            <h3>In-Browser Compiler</h3>
            <p style={{ color: "#555" }}>
              Write, test, and debug your code instantly with our powerful
              in-browser compiler
            </p>
          </div>
          {/* Card 2 */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 12px #e0e7ef33",
              padding: "2rem",
              width: "300px",
            }}
          >
            <div
              style={{
                background: "#dcfce7",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
              }}
            >
              <span style={{ fontSize: "1.5rem", color: "#22c55e" }}>📖</span>
            </div>
            <h3>Curated Problems</h3>
            <p style={{ color: "#555" }}>
              Access carefully selected coding problems that mirror real
              interview questions
            </p>
          </div>
          {/* Card 3 */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 12px #e0e7ef33",
              padding: "2rem",
              width: "300px",
            }}
          >
            <div
              style={{
                background: "#f3e8ff",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
              }}
            >
              <span style={{ fontSize: "1.5rem", color: "#a855f7" }}>🎖️</span>
            </div>
            <h3>Instant Feedback</h3>
            <p style={{ color: "#555" }}>
              Get immediate results and detailed feedback to improve your coding
              skills
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
