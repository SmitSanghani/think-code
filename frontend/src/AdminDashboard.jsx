import React, { useState, useEffect } from "react";
import API_BASE_URL from "./apiConfig";

// Tag/Badge component for level/category
function Badge({ children, color }) {
  return (
    <span style={{
      background: `${color || '#3b82f6'}15`,
      color: color || '#3b82f6',
      border: `1px solid ${(color || '#3b82f6')}40`,
      borderRadius: 9999,
      padding: '6px 10px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.3
    }}>{children}</span>
  );
}

export default function AdminDashboard({ onLogout, onOpenSubmissions }) {
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    language: "JavaScript",
    description: "",
    testCases: "",
    expectedOutput: "",
    solution: "",
    category: "Basics",
    type: "Problem Solving",
    estimatedTime: "15-30 min"
  });
  const [usersCount, setUsersCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);

  useEffect(() => {
    // Load questions from MongoDB API
    fetchQuestions();

    // Fetch totals
    (async () => {
      // 1) Users count from backend (preferred)
      try {
        const r = await fetch(`${API_BASE_URL}/students/count`);
        if (r.ok) {
          const j = await r.json();
          if (typeof j.count === 'number') setUsersCount(j.count);
        }
      } catch (_) {}

      let subs = [];
      try {
        const res = await fetch(`${API_BASE_URL}/submissions`);
        if (res.ok) {
          const list = await res.json();
          subs = Array.isArray(list) ? list : [];
          setSubmissionsCount(subs.length);
        }
      } catch (_) {}

      // Merge offline/local submissions
      try {
        const local = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
        if (Array.isArray(local) && local.length) {
          subs = [...subs, ...local];
        }
      } catch (_) {}


      try {
        if (!usersCount) {
          const usersSet = new Set(
            subs
              .map((s) => s && s.studentEmail)
              .filter((e) => typeof e === 'string' && e.trim().length > 0)
          );
          if (usersSet.size === 0) {
            const res2 = await fetch(`${API_BASE_URL}/stats/students`);
            if (res2.ok) {
              const agg = await res2.json();
              if (Array.isArray(agg)) {
                agg.forEach((a) => a && a.studentEmail && usersSet.add(a.studentEmail));
              }
            }
          }
          setUsersCount((c) => (c || usersSet.size));
        }
      } catch (_) {}
    })();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('🔄 Fetching questions from MongoDB API...');
      
      // First try to get questions from MongoDB API
      const response = await fetch(`${API_BASE_URL}/questions`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Questions loaded from MongoDB:', data);
        setQuestions(data);
        return;
    } else {
        console.error('❌ MongoDB API error:', response.status);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
    }
    
    // Fallback to localStorage if MongoDB API fails
    try {
      console.log('🔄 Falling back to localStorage...');
      const adminQuestions = localStorage.getItem('adminQuestions');
      if (adminQuestions) {
        const parsedQuestions = JSON.parse(adminQuestions);
        if (parsedQuestions && parsedQuestions.length > 0) {
          console.log('✅ Questions loaded from localStorage:', parsedQuestions);
          setQuestions(parsedQuestions);
          return;
        }
      }
    } catch (localStorageError) {
      console.error('❌ localStorage error:', localStorageError);
    }
    
    // Final fallback to mock data if everything fails
    console.log('🔄 Using default mock data...');
    const defaultQuestions = [
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
    ];
    setQuestions(defaultQuestions);
    console.log('✅ Default questions set:', defaultQuestions);
  };

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/students/count`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (typeof j.count === 'number') setUsersCount(j.count);
      }
    } catch (_) {}

    let subs = [];
    try {
      const res = await fetch(`${API_BASE_URL}/submissions`, { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        subs = Array.isArray(list) ? list : [];
        setSubmissionsCount(subs.length);
      }
    } catch (_) {}

    try {
      const local = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
      if (Array.isArray(local) && local.length) {
        subs = [...subs, ...local];
      }
    } catch (_) {}

    try {
      const usersSet = new Set(
        subs
          .map((s) => s && s.studentEmail)
          .filter((e) => typeof e === 'string' && e.trim().length > 0)
      );
      if (usersSet.size === 0) {
        const res2 = await fetch(`${API_BASE_URL}/stats/students`, { cache: 'no-store' });
        if (res2.ok) {
          const agg = await res2.json();
          if (Array.isArray(agg)) {
            agg.forEach((a) => a && a.studentEmail && usersSet.add(a.studentEmail));
          }
        }
      }
      setUsersCount(usersSet.size);
    } catch (_) {}
  };

  const handleRefresh = async () => {
    await Promise.all([fetchQuestions(), fetchStats()]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        // Update existing question in MongoDB
        const response = await fetch(`${API_BASE_URL}/questions/${editingQuestion._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const updatedQuestion = await response.json();
          const updatedQuestions = questions.map(q => 
            q._id === editingQuestion._id ? updatedQuestion : q
          );
          setQuestions(updatedQuestions);
          console.log('✅ Question updated in MongoDB:', updatedQuestion);
        } else {
          console.error('❌ Error updating question:', response.status);
        }
        setEditingQuestion(null);
      } else {
        // Create new question in MongoDB
        const response = await fetch(`${API_BASE_URL}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const newQuestion = await response.json();
          setQuestions(prev => [...prev, newQuestion]);
          console.log('✅ Question added to MongoDB:', newQuestion);
    } else {
          console.error('❌ Error creating question:', response.status);
        }
      }
      
      // Reset form
      setFormData({
        title: "",
        difficulty: "Easy",
        language: "JavaScript",
        description: "",
        testCases: "",
        expectedOutput: "",
        solution: "",
        category: "Basics",
        type: "Problem Solving",
        estimatedTime: "15-30 min"
      });
      setShowAddQuestion(false);
      
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Error saving question. Please try again.');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      difficulty: question.difficulty,
      language: question.language,
      description: question.description,
      testCases: question.testCases,
      expectedOutput: question.expectedOutput,
      solution: question.solution || "",
      category: question.category,
      type: question.type,
      estimatedTime: question.estimatedTime
    });
    setShowAddQuestion(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const updatedQuestions = questions.filter(q => q._id !== questionId);
          setQuestions(updatedQuestions);
          console.log('✅ Question deleted from MongoDB:', questionId);
        } else {
          console.error('❌ Error deleting question:', response.status);
        }
      } catch (error) {
        console.error('❌ Network error:', error);
        alert('Error deleting question. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddQuestion(false);
    setEditingQuestion(null);
    setFormData({
      title: "",
      difficulty: "Easy",
      language: "JavaScript",
      description: "",
      testCases: "",
      expectedOutput: "",
      category: "Basics",
      type: "Problem Solving",
      estimatedTime: "15-30 min"
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      padding: '2rem',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '1.8rem 2rem',
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)'
        }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            👑 Admin Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenSubmissions} style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.2rem',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(59,130,246,0.20)'
            }}>
              📄 Submissions
            </button>
            <button onClick={handleRefresh} style={{
              background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.2rem',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16,185,129,0.20)'
            }}>
              🔄 Refresh
            </button>
            <button onClick={onLogout} style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.2rem',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(239,68,68,0.20)'
            }}>
              Logout
            </button>
        </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem 1.2rem', boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
            <div style={{ color: '#64748b', fontWeight: 800 }}>Total Questions</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: '#0f172a' }}>{questions.length}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem 1.2rem', boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
            <div style={{ color: '#64748b', fontWeight: 800 }}>Total Users</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: '#0f172a' }}>{usersCount}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem 1.2rem', boxShadow: '0 4px 18px rgba(2,6,23,0.06)' }}>
            <div style={{ color: '#64748b', fontWeight: 800 }}>Total Submissions</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: '#0f172a' }}>{submissionsCount}</div>
          </div>
        </div>

        {/* Add Question Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setShowAddQuestion(true)}
            style={{
              background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 1.4rem',
              borderRadius: 14,
              cursor: 'pointer',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: 0.3,
              boxShadow: '0 8px 22px rgba(59,130,246,0.25)'
            }}
          >
            ➕ Add New Question
          </button>
      </div>

        {/* Add/Edit Question Form */}
        {showAddQuestion && (
        <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: 16,
            marginBottom: '2rem',
            boxShadow: '0 8px 26px rgba(2,6,23,0.10)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontWeight: 800 }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Section: Question Details */}
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Question Details</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '2rem', rowGap: '1.25rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter question title"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Section: Attributes */}
              <div style={{ fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>Attributes</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '2rem', rowGap: '1.25rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                    >
                      <option value="JavaScript">JavaScript</option>
                     
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Basics, Arrays, Strings"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Section: Problem Description */}
              <div style={{ fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>Problem Description</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="8"
                    placeholder="Describe the problem clearly. Include what the student needs to implement."
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 12,
                      fontSize: '1rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      background: '#f9fafb'
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                  />
                </div>
              </div>

              {/* Section: Test Cases */}
              <div style={{ fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>Test Cases</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '2rem', rowGap: '1.25rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Test Cases</label>
                    <textarea
                      name="testCases"
                      value={formData.testCases}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder={'Input: [1,2,3]\nExpected Output: 6'}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        resize: 'vertical',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Expected Output</label>
                    <textarea
                      name="expectedOutput"
                      value={formData.expectedOutput}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder={'e.g., 6'}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        resize: 'vertical',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Solution (Admin-provided answer/hints) */}
              <div style={{ fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>Solution</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Solution / Explanation (required)</label>
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    rows="7"
                    placeholder={'Example JavaScript solution or explanation...'}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 12,
                      fontSize: '1rem',
                      resize: 'vertical',
                      transition: 'all 0.2s ease',
                      background: '#f9fafb'
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                    required
                  />
                </div>
              </div>
              
              {/* Section: Meta Information */}
              <div style={{ fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>Meta Information</div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
              <div style={{ background: '#fbfdff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '2rem', rowGap: '1.25rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Type</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="e.g., Algorithm, Arrays, Strings"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>Estimated Time</label>
                    <input
                      type="text"
                      name="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 10-15 min"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb'
                      }}
                      onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)'; e.target.style.background = '#ffffff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      onMouseEnter={(e) => { e.target.style.border = '1px solid #cbd5e1'; }}
                      onMouseLeave={(e) => { e.target.style.border = '1px solid #d1d5db'; }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.9rem 1.4rem',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 800,
                }}>
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button type="button" onClick={handleCancel} style={{
                  background: '#111827',
                  color: 'white',
                  border: 'none',
                  padding: '0.9rem 1.4rem',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 800,
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div style={{ marginBottom: '1.2rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
            📚 Questions ({questions.length})
          </h2>
        </div>

        {/* Questions Grid */}
        <div style={{ maxWidth: 900, margin: '24px auto 0 auto' }}>
          {questions.map((q) => (
            <div key={q._id || q.id} style={{
              background: 'white',
              borderRadius: 16,
              padding: '1.6rem',
              marginBottom: '1rem',
              boxShadow: '0 6px 22px rgba(2,6,23,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'transform 120ms ease, box-shadow 120ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(2,6,23,0.08)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.6rem 0', color: '#0f172a', letterSpacing: '-0.3px' }}>{q.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Badge color="#10b981">{q.difficulty}</Badge>
                    <Badge color="#3b82f6">{q.language}</Badge>
                    <Badge color="#8b5cf6">{q.category}</Badge>
                    <Badge color="#f59e0b">{q.type}</Badge>
                    <Badge color="#6b7280">{q.estimatedTime}</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(q)} style={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 700
                  }}>Edit</button>
                  <button onClick={() => handleDelete(q._id || q.id)} style={{
                    background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 700
                  }}>Delete</button>
                </div>
              </div>
              
              <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: 1.7 }}>
                {q.description}
              </p>
              
              {q.testCases && (
                <div style={{ marginBottom: '1rem' }}>
                  <b>Test Cases:</b>
                  <pre style={{ 
                    background: '#f8fafc', 
                    padding: '0.9rem', 
                    borderRadius: 10, 
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.92rem',
                    overflow: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>{q.testCases}</pre>
                </div>
              )}
              
              {q.expectedOutput && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <b>Expected Output:</b>
                  <pre style={{ 
                    background: '#f8fafc', 
                    padding: '0.9rem', 
                    borderRadius: 10, 
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.92rem',
                    overflow: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>{q.expectedOutput}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
