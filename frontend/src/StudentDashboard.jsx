import React, { useEffect, useState } from "react";
import API_BASE_URL from "./apiConfig";

export default function StudentDashboard({ onStartProblem, studentEmail, onBack, onOpenProfile }) {
  const [problems, setProblems] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    // Fetch problems from backend
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      // Always try MongoDB API first so latest changes are shown
      const response = await fetch(`${API_BASE_URL}/questions?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProblems(data);
          return;
        }
      } else {
        console.error('❌ MongoDB API error:', response.status);
      }
    } catch (error) {
      console.error('❌ Network error while fetching from API:', error);
    }

    // Fallback to localStorage if API fails or returns empty
    try {
      const adminQuestions = localStorage.getItem('adminQuestions');
      if (adminQuestions) {
        const parsedQuestions = JSON.parse(adminQuestions);
        if (parsedQuestions && parsedQuestions.length > 0) {
          setProblems(parsedQuestions);
          return;
        }
      }
    } catch (localStorageError) {
      console.error('❌ localStorage error:', localStorageError);
    }

    // Final fallback to mock data if everything fails
    setProblems([
      {
        id: 1,
        title: "Print Hello World",
        difficulty: "Easy",
        language: "JavaScript",
        description: "Write a JavaScript code to print 'Hello World' in the console. Use console.log() function to display the message.",
        testCases: "No input required\nExpected Output: Hello World",
        expectedOutput: "Hello World",
        category: "Basics",
        type: "Print Statement",
        estimatedTime: "5-10 min"
      },
      {
        id: 2,
        title: "Calculate Sum of Numbers",
        difficulty: "Easy",
        language: "JavaScript",
        description: "Write a function that takes an array of numbers and returns the sum of all numbers. Example: sum([1, 2, 3, 4, 5]) should return 15.",
        testCases: "Input: [1, 2, 3, 4, 5]\nExpected Output: 15\n\nInput: [10, 20, 30]\nExpected Output: 60",
        expectedOutput: "15",
        category: "Basics",
        type: "Array Operations",
        estimatedTime: "10-15 min"
      },
      {
        id: 3,
        title: "Check Even or Odd",
        difficulty: "Easy",
        language: "JavaScript",
        description: "Write a function that takes a number and returns 'Even' if the number is even, or 'Odd' if the number is odd.",
        testCases: "Input: 4\nExpected Output: Even\n\nInput: 7\nExpected Output: Odd\n\nInput: 0\nExpected Output: Even",
        expectedOutput: "Even",
        category: "Basics",
        type: "Conditional Logic",
        estimatedTime: "10-15 min"
      }
    ]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleBack = () => {
    console.log('Back button clicked!');
    console.log('onBack function:', onBack);
    if (onBack && typeof onBack === 'function') {
      console.log('Calling onBack function...');
      onBack();
    } else {
      console.log('onBack not available, using browser back');
      // Fallback to browser back
      window.history.back();
    }
  };

  const handleStartProblem = (problem) => {
    console.log('Start Problem button clicked!');
    console.log('Problem data:', problem);
    console.log('onStartProblem function:', onStartProblem);
    
    if (onStartProblem && typeof onStartProblem === 'function') {
      console.log('Calling onStartProblem function...');
      onStartProblem(problem);
    } else {
      console.log('onStartProblem not available!');
    }
  };

  const handleQuestionClick = (problem) => {
    // Show verification popup when question card is clicked
    handleStartProblem(problem);
  };

  const handleLogout = () => {
    // Clear localStorage and redirect to home
    localStorage.removeItem('studentEmail');
    window.location.reload(); // Simple way to reset all states
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg,rgb(223, 235, 248) 0%,rgb(197, 209, 247) 100%)',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      padding: '2rem 0',
    }}>
      {/* Topbar full width background */}
      <div style={{ width: '100%', background: 'transparent' }}>
        <div style={{ maxWidth: '1700px', margin: '0 auto', padding: '0 2vw' }}>
          {/* Unified Header Card - single row */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 6px 32px 0 rgba(30, 41, 59, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2.5rem',
          }}>
            {/* Left: Back, Title, Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem', minWidth: 0 }}>
              <button 
                onClick={handleBack}
                style={{
                  border: 'none',
                  background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
                  color: 'white',
                  padding: '0.9rem 2rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px 0 rgba(59, 130, 246, 0.10)',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  width: 'fit-content',
                }}
              >
                ← Back to Home
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
                <h1 style={{
                  margin: 0,
                  fontSize: '2.2rem',
                  fontWeight: '800',
                  color: '#1e293b',
                  letterSpacing: '-1px',
                  lineHeight: 1.1,
                }}>
                  Practice Problems
                </h1>
                <p style={{
                  color: '#64748b',
                  fontSize: '1.08rem',
                  margin: 0,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}>
                  Choose a problem to start coding and boost your skills!
                </p>
              </div>
            </div>
            {/* Right: Welcome, Profile, Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minWidth: 0 }}>
              <span style={{
                color: '#6366f1',
                fontSize: '1.08rem',
                background: '#eef2ff',
                padding: '0.7rem 1.3rem',
                borderRadius: '10px',
                fontWeight: 600,
                border: '1.5px solid #c7d2fe',
                marginBottom: 0,
                wordBreak: 'break-all',
              }}>
                Welcome, {studentEmail}
              </span>
              <button style={{
                padding: '0.7rem 1.3rem',
                border: '1.5px solid #6366f1',
                borderRadius: '10px',
                background: 'white',
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.05rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = '#6366f1'; e.target.style.color = 'white'; }}
              onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = '#6366f1'; }}
              onClick={() => onOpenProfile && onOpenProfile()}>
                Profile
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '0.7rem 1.3rem',
                  border: '1.5px solid #ef4444',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = '#ef4444'; e.target.style.color = 'white'; }}
                onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = '#ef4444'; }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* Problems Count */}
        <div style={{
          width: '100%',
          // background: 'linear-gradient(90deg, #f1f5f9 0%, #e0e7ff 100%)',
          padding: '1.2rem 2rem',
          marginBottom: '2.5rem',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent:  'center',
          gap: '0.8rem',
          fontWeight: 600,
          fontSize: '1.1rem',
          color: '#6366f1',
          boxShadow: '0 2px 12px 0 rgba(59, 130, 246, 0.06)',
        }}>
          <span style={{ fontSize: '1.3rem' }}>📚</span>
          <span style={{ color: '#334155' }}>Showing {problems.length} problems</span>
        </div>
        {/* Problems List */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {problems.map((problem) => (
            <div 
              key={problem._id || problem.id}
              onClick={() => handleQuestionClick(problem)}
              style={{
                width: '80%',
                margin: '0 auto',
                background: 'white',
                borderRadius: '18px',
                padding: '2.2rem 2.2rem 2rem 2.2rem',
                border: 'none',
                boxShadow: '0 4px 24px 0 rgba(30, 41, 59, 0.10)',
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(99, 102, 241, 0.13)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(30, 41, 59, 0.10)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Title and Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.1rem' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      color: '#1e293b',
                      letterSpacing: '-0.5px',
                    }}>
                      {problem.title}
                    </h3>
                    <span style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      background: getDifficultyColor(problem.difficulty) + '15',
                      color: getDifficultyColor(problem.difficulty),
                      border: `1px solid ${getDifficultyColor(problem.difficulty)}30`,
                    }}>
                      {problem.difficulty}
                    </span>
                    <span style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.95rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}>
                      {problem.language}
                    </span>
                  </div>
                  {/* Description */}
                  <p style={{ 
                    color: '#475569', 
                    lineHeight: '1.7', 
                    marginBottom: '1.7rem',
                    fontSize: '1.08rem',
                  }}>
                    {problem.description}
                  </p>
                  {/* Meta Information */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2rem',
                    padding: '1.2rem',
                    background: '#e0f2fe',
                    borderRadius: '12px',
                    border: 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>⏱️</span>
                      <span style={{ color: '#64748b', fontSize: '0.98rem' }}>
                        {problem.estimatedTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📖</span>
                      <span style={{ color: '#64748b', fontSize: '0.98rem' }}>
                        {problem.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>🏆</span>
                      <span style={{ color: '#64748b', fontSize: '0.98rem' }}>
                        {problem.type}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Start Problem Button */}
                <button
                  onClick={() => handleStartProblem(problem)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '1.08rem',
                    minWidth: '140px',
                    boxShadow: '0 2px 8px 0 rgba(16, 185, 129, 0.10)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'linear-gradient(90deg, #22d3ee 0%, #10b981 100%)'; }}
                  onMouseLeave={e => { e.target.style.background = 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)'; }}
                >
                  Start Problem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
} 