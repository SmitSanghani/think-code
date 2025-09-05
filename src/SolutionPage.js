import React, { useEffect, useState } from "react";

export default function SolutionPage({ question, onBack, studentEmail }) {
  const [loadedQuestion, setLoadedQuestion] = useState(question || null);
  const [code, setCode] = useState(() => {
    // Set default code based on question type
    if (question?.id === 1) {
      return `function solution() {
  // Write your solution here
  // Use console.log() to print 'Hello World'
}`;
    } else if (question?.id === 2) {
      return `function add(a, b) {
  // Write your solution here
  // Return the sum of two variables a and b
}`;
    } else if (question?.id === 3) {
      return `function sum(arr) {
  // Write your solution here
  // Return the sum of all numbers in the array
}`;
    } else if (question?.id === 4) {
      return `function evenOdd(num) {
  // Write your solution here
  // Return 'Even' if number is even, 'Odd' if odd
}`;
    } else if (
               question?.title?.toLowerCase().includes('print numbers') ||
               (question?.title?.toLowerCase().includes('for loop') && (
                 question?.title?.toLowerCase().includes('number') || /\b\d+\b/.test(question?.title?.toLowerCase())
               ))
              ) {
      return `function printNumbers() {
  // Write your solution here
  // Use for loop to print numbers from 1 to 5
  // Each number should be printed on a new line
}`;
    } else {
      return `function solution() {
  // Write your solution here
}`;
    }
  });
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastRunSuccess, setLastRunSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use loadedQuestion for rendering and API lookups
  const q = loadedQuestion || question || {};

  // Try to refresh question from API if solution is missing
  useEffect(() => {
    let cancelled = false;
    async function refreshIfNeeded() {
      try {
        const hasSolution = !!(loadedQuestion && loadedQuestion.solution && String(loadedQuestion.solution).trim());
        if (hasSolution) return;
        const id = q?._id;
        const title = (q?.title || '').trim();
        if (id) {
          const resOne = await fetch(`http://localhost:5000/api/questions/${id}?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (resOne.ok) {
            const doc = await resOne.json();
            if (!cancelled && doc) {
              setLoadedQuestion(doc);
              return;
            }
          }
        }
        // Fallback to list lookup by title if id fetch failed
        const res = await fetch(`http://localhost:5000/api/questions?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
        if (!res.ok) return;
        const list = await res.json();
        if (!Array.isArray(list)) return;
        const found = title ? list.find(q => q && q.title === title) : null;
        if (!cancelled && found) setLoadedQuestion(found);
      } catch (_) {}
    }
    refreshIfNeeded();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?._id]);

  // When user opens the Solution tab, fetch the freshest copy by _id
  useEffect(() => {
    let cancelled = false;
    async function fetchLatestOnTabOpen() {
      if (activeTab !== 'solution') return;
      const id = q?._id;
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/questions/${id}?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
        if (!res.ok) return;
        const doc = await res.json();
        if (!cancelled && doc) setLoadedQuestion(doc);
      } catch (_) {}
    }
    fetchLatestOnTabOpen();
    return () => { cancelled = true; };
  }, [activeTab, q?._id]);

  // q already defined above

  // Question-specific validation functions
  const validateCode = (code, questionId) => {
    try {
      // Map question title to validation logic
      const questionTitle = q?.title?.toLowerCase() || '';
      
      // Generic early check: if expectedOutput is provided, accept any method that produces matching output
      if (q?.expectedOutput) {
        try {
          const normalize = (str) => (str || '')
            .toString()
            .replace(/\r\n?/g, '\n')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join('\n');

          let consoleOutput = '';
          const originalLog = console.log;
          console.log = (...args) => {
            consoleOutput += args.join(' ') + '\n';
          };

          eval(code);

          console.log = originalLog;

          const expected = normalize(q.expectedOutput);
          const actual = normalize(consoleOutput);

          if (actual === expected) {
            return {
              success: true,
              message: `✅ Success! Your output matches expected output.\n\nOutput:\n${actual}`
            };
          }

          return {
            success: false,
            error: `❌ Wrong output.\n\nExpected:\n${expected}\n\nYour Output:\n${actual || 'Nothing printed'}`
          };
        } catch (e) {
          return { success: false, error: `❌ Runtime error: ${e.message}` };
        }
      }
 
      if (questionTitle.includes('hello world')) {
        // Case 1: Print Hello World
        if (!code.includes('console.log') && !code.includes('console.log(')) {
          return {
            success: false,
            error: "❌ Your code is missing console.log()!\n\nPlease use console.log() to print 'Hello World'.\n\nExample:\nconsole.log('Hello World');"
          };
        }
        
        if (!code.includes('Hello World') && !code.includes('Hello') && !code.includes('World')) {
          return {
            success: false,
            error: "❌ Your code is missing 'Hello World' text!\n\nPlease print exactly 'Hello World' or similar greeting message.\n\nExample:\nconsole.log('Hello World');"
          };
        }
        
        // Try to execute the code
        try {
          // Capture console.log output
          let consoleOutput = '';
          const originalLog = console.log;
          console.log = (...args) => {
            consoleOutput += args.join(' ') + '\n';
          };
          
          eval(code);
          
          // Restore console.log
          console.log = originalLog;
          
          if (consoleOutput.includes('Hello World') || consoleOutput.includes('Hello') || consoleOutput.includes('World')) {
            return {
              success: true,
              message: "✅ Perfect! Your code successfully prints a greeting message!\n\nConsole Output:\n" + consoleOutput.trim() + "\n\nGreat job! You've mastered the basics of console output."
            };
          } else {
            return {
              success: false,
              error: "❌ Your code doesn't print the expected message!\n\nConsole Output:\n" + (consoleOutput.trim() || 'Nothing printed') + "\n\nPlease make sure to print 'Hello World' or a greeting message."
            };
          }
        } catch (e) {
          return {
            success: false,
            error: "❌ Your code has syntax errors!\n\nError: " + e.message + "\n\nPlease fix the syntax and try again.\n\nExample:\nconsole.log('Hello World');"
          };
        }
        
      } else if (questionTitle.includes('sum') && questionTitle.includes('variable')) {
        // Case 2: Summing two variables
        // Check if code contains addition logic
        if (!code.includes('+') && !code.includes('add') && !code.includes('sum')) {
          return {
            success: false,
            error: "❌ Your code is missing addition logic!\n\nPlease use the + operator or create a function to add two variables.\n\nExample:\nfunction add(a, b) { return a + b; }"
          };
        }
        
        // Check if code has function or variable declaration
        if (!code.includes('function') && !code.includes('let') && !code.includes('const') && !code.includes('var')) {
          return {
            success: false,
            error: "❌ Your code should have a function or variables!\n\nPlease create a function or declare variables to add.\n\nExample:\nfunction add(a, b) { return a + b; }"
          };
        }
        
        // Try to execute the code
        try {
          // Test with sample values
          const testResult = eval(`(${code})(5, 3)`);
          
          if (testResult === 8) {
            return {
              success: true,
              message: "✅ Perfect! Your addition function works correctly!\n\nTest: add(5, 3) = " + testResult + "\n\nGreat job! You've successfully implemented addition logic."
            };
          } else {
            return {
              success: false,
              error: "❌ Your addition function has incorrect output!\n\nExpected: add(5, 3) = 8\nYour Output: " + testResult + "\n\nPlease check your addition logic and try again."
            };
          }
        } catch (e) {
          return {
            success: false,
            error: "❌ Your code has syntax errors!\n\nError: " + e.message + "\n\nPlease fix the syntax and try again.\n\nExample:\nfunction add(a, b) { return a + b; }"
          };
        }
        
      } else if (questionTitle.includes('sum') && questionTitle.includes('array')) {
        // Case 3: Calculate Sum of Numbers (Array)
        // Check if code contains array logic
        if (!code.includes('reduce') && !code.includes('forEach') && !code.includes('for') && !code.includes('map')) {
          return {
            success: false,
            error: "❌ Your code is missing array iteration logic!\n\nPlease use reduce(), forEach(), for loop, or map() to iterate through the array.\n\nExample:\nfunction sum(arr) { return arr.reduce((sum, num) => sum + num, 0); }"
          };
        }
        
        // Try to execute the code
        try {
          const testArray = [1, 2, 3, 4, 5];
          const result = eval(`(${code})(${JSON.stringify(testArray)})`);
          
          if (result === 15) {
            return {
              success: true,
              message: "✅ Perfect! Your array sum function works correctly!\n\nTest: sum([1, 2, 3, 4, 5]) = 15\n\nGreat job! You've successfully implemented array summation."
            };
          } else {
            return {
              success: false,
              error: "❌ Your array sum function has incorrect output!\n\nExpected: sum([1, 2, 3, 4, 5]) = 15\nYour Output: " + result + "\n\nPlease check your array logic and try again."
            };
          }
        } catch (e) {
          return {
            success: false,
            error: "❌ Your code has syntax errors!\n\nError: " + e.message + "\n\nPlease fix the syntax and try again.\n\nExample:\nfunction sum(arr) { return arr.reduce((sum, num) => sum + num, 0); }"
          };
        }
        
      } else if (questionTitle.includes('even') || questionTitle.includes('odd')) {
        // Case 4: Check Even or Odd
        // Check if code contains logic to determine even/odd
        if (!code.includes('even') && !code.includes('odd') && !code.includes('for') && !code.includes('if')) {
          return {
            success: false,
            error: "❌ Your code is missing even/odd logic!\n\nPlease use a loop and if statement to check if a number is even or odd.\n\nExample:\nfunction evenOdd(num) {\n  if (num % 2 === 0) {\n    return 'Even';\n  } else {\n    return 'Odd';\n  }\n}"
          };
        }
        
        // Try to execute the code
        try {
          const testNumber = 7;
          const testResult = eval(`(${code})(${testNumber})`);
          
          if (testResult === 'Odd') {
            return {
              success: true,
              message: "✅ Perfect! Your even/odd function works correctly!\n\nTest: evenOdd(7) = " + testResult + "\n\nGreat job! You've successfully implemented even/odd logic."
            };
          } else {
            return {
              success: false,
              error: "❌ Your even/odd function has incorrect output!\n\nExpected: evenOdd(7) = 'Odd'\nYour Output: " + testResult + "\n\nPlease check your even/odd logic and try again."
            };
          }
        } catch (e) {
          return {
            success: false,
            error: "❌ Your code has syntax errors!\n\nError: " + e.message + "\n\nPlease fix the syntax and try again.\n\nExample:\nfunction evenOdd(num) {\n  if (num % 2 === 0) {\n    return 'Even';\n  } else {\n    return 'Odd';\n  }\n}"
          };
        }
        
      } else if (
        questionTitle.includes('print numbers') ||
        (questionTitle.includes('for loop') && (questionTitle.includes('number') || /\b\d+\b/.test(questionTitle)))
      ) {
         // Case 5: For Loop Questions (Print Numbers)
         // Require function named printNumbers
         if (!/function\s+printNumbers\s*\(/.test(code) && !/const\s+printNumbers\s*=\s*\(/.test(code)) {
           return { success: false, error: "❌ The function must be named 'printNumbers'." };
         }

         // Execute user's function, capture console, compare output
         try {
           const normalizeLines = (str) => (str || '')
             .toString()
             .replace(/\r\n?/g, '\n')
             .split('\n')
             .map(s => s.trim())
             .filter(Boolean);

           const normalizeTokens = (str) => normalizeLines(str)
             .join(' ')
             .split(/\s+/)
             .filter(Boolean)
             .join(' ');

           const originalLog = console.log;
           let consoleOutput = '';
           console.log = (...args) => { consoleOutput += args.join(' ') + '\n'; };

           // Evaluate code and call the function
           const fn = eval(`(function(){\n${code}\n; return typeof printNumbers === 'function' ? printNumbers : null; })()`);
           if (typeof fn !== 'function') {
             console.log = originalLog;
             return { success: false, error: "❌ Couldn't find function printNumbers()." };
           }
           // Clear any console output produced during eval (e.g., if user called printNumbers() at top-level)
           consoleOutput = '';
           fn();
           console.log = originalLog;

           // Expected can be newline-separated or space-separated; accept both
           const expected = question?.expectedOutput || '1\n2\n3\n4\n5';
           const expectedLines = normalizeLines(expected);
           const actualLines = normalizeLines(consoleOutput);

           const linesMatch = actualLines.join('\n') === expectedLines.join('\n');
           const tokensMatch = normalizeTokens(consoleOutput) === normalizeTokens(expected);

           if (linesMatch || tokensMatch) {
             return { success: true, message: `✅ Success!\n\nOutput:\n${actualLines.join('\n')}` };
           }

           return {
             success: false,
             error: `❌ Wrong output.\n\nExpected:\n${expectedLines.join('\n')}\n\nYour Output:\n${actualLines.join('\n') || 'Nothing printed'}`
           };
         } catch (e) {
           return { success: false, error: `❌ Runtime error: ${e.message}` };
         }
         
       } else {
        // Default case for unknown questions
        return {
          success: false,
          error: "❌ Question type not recognized!\n\nPlease make sure you're working on a supported question type.\n\nSupported types:\n- Print Hello World\n- Summing two variables\n- Calculate Sum of Numbers\n- Check Even or Odd\n- For Loop (Print Numbers)"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "❌ Code execution error!\n\nError: " + error.message + "\n\nPlease check your syntax and try again."
      };
    }
  };

  const submitSolution = async () => {
    if (!lastRunSuccess) {
      setOutput('❌ You can only submit after a successful run.');
      return;
    }
    try {
      const emailToUse = (studentEmail && studentEmail.trim()) || (typeof localStorage !== 'undefined' && localStorage.getItem('studentEmail')) || '';
      const studentId = (typeof localStorage !== 'undefined' && localStorage.getItem('studentId')) || null;
      if (!emailToUse) {
        setOutput('❌ Please log in before submitting.');
        return;
      }
      const payload = {
        studentEmail: emailToUse,
        studentId: studentId || undefined,
        questionId: q._id,
        questionTitle: q.title,
        language: q.language || 'JavaScript',
        code,
        output,
        isCorrect: true,
        difficulty: q.difficulty
      };
      const pageOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      const apiBases = [
        // environment override
        (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || '',
        // common localhost bases
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        pageOrigin
      ].filter(Boolean);
      const paths = ['/api/submissions', '/submissions'];
      const endpoints = [`${pageOrigin}/api/submissions`, `${pageOrigin}/submissions`, '/api/submissions', '/submissions'];
      for (const base of apiBases) {
        for (const p of paths) endpoints.push(`${base}${p}`);
      }
      let success = false;
      let lastErr = null;
      const tried = [];
      for (const url of endpoints) {
        try {
          tried.push(url);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            setHasSubmitted(true);
            setOutput(`✅ Submitted successfully!\nGrade: ${data.submission?.grade || 'A'}`);
            success = true;
            break;
          } else {
            lastErr = await res.json().catch(() => ({ error: String(res.status) }));
          }
        } catch (e) {
          lastErr = { error: e.message };
        }
      }
      if (!success) {
        // Save locally so admin can still review while backend is offline
        try {
          const local = JSON.parse(localStorage.getItem('localSubmissions') || '[]');
          const localRecord = {
            _localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            studentEmail: emailToUse,
            questionId: q._id,
            questionTitle: q.title,
            language: q.language || 'JavaScript',
            code,
            output,
            isCorrect: true,
            grade: null,
            submittedAt: new Date().toISOString()
          };
          local.unshift(localRecord);
          localStorage.setItem('localSubmissions', JSON.stringify(local));
          setHasSubmitted(true);
          setOutput('✅ Submitted successfully! (saved offline). Admin can view this in Submissions.');
          return;
        } catch (_) {
          setOutput(`❌ Submit failed: ${lastErr?.error || 'Unknown error'}\nTried: ${tried.join(', ')}`);
        }
      }
    } catch (e) {
      setOutput(`❌ Submit failed: ${e.message}`);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput("❌ Please write some code first!");
      setLastRunSuccess(false);
      setIsRunning(false); // Always reset running state
      return false;
    }
    
    setIsRunning(true);
    try {
      // Validate code based on question (use student's code only)
      const validation = validateCode(code, q?.id);
      
      if (validation.success) {
        setOutput(validation.message);
        setLastRunSuccess(true);
      } else {
        setOutput(validation.error);
        setLastRunSuccess(false);
      }
      
      setIsRunning(false);
      return validation.success;
    } catch (error) {
      setOutput("❌ Unexpected error: " + error.message);
      setIsRunning(false);
      setLastRunSuccess(false);
      return false;
    }
  };

  const handleSubmitClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let ok = lastRunSuccess;
    if (!ok) ok = await runCode();
    if (!ok) {
      setIsSubmitting(false); // Always reset submitting state
      return;
    }
    await submitSolution();
    setIsSubmitting(false);
  };

  const resetCode = () => {
    setCode(`function solution() {
// Write your solution here
}`);
    setOutput("");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header/Navigation Bar */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: '1.8rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 6px 28px rgba(30,41,59,0.10)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              onClick={handleBack}
              style={{
                border: 'none',
                background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '0.7rem 1.2rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 2px 8px rgba(59,130,246,0.12)'
              }}
            >
              ← Back to Problems
            </button>
            
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2rem', 
                fontWeight: '700',
                color: '#1e293b',
                letterSpacing: '-0.5px'
              }}>
                {q?.title || 'JavaScript Array Methods'}
              </h1>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
                <span style={{
                  padding: '0.28rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  background: (getDifficultyColor(q?.difficulty || 'Medium') + '15'),
                  color: getDifficultyColor(q?.difficulty || 'Medium'),
                  border: `1px solid ${getDifficultyColor(q?.difficulty || 'Medium')}30`
                }}>
                  {q?.difficulty || 'Medium'}
                </span>
                <span style={{
                  padding: '0.28rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  background: '#eef2ff',
                  color: '#4f46e5',
                  border: '1px solid #c7d2fe',
                  fontWeight: 700
                }}>
                  {q?.language || 'JavaScript'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ 
              color: '#6366f1', 
              fontSize: '0.95rem',
              background: '#eef2ff',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              marginRight: '0.4rem'
            }}>
              {studentEmail || 'student@example.com'}
            </span>
            <button
              onClick={resetCode}
              style={{
                padding: '0.55rem 0.9rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ↻ Reset
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              style={{
                padding: '0.55rem 0.9rem',
                border: 'none',
                borderRadius: '8px',
                background: isRunning ? '#9ca3af' : '#10b981',
                color: 'white',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
              }}
            >
              ▶ Run Code
            </button>
            <button
              disabled={isSubmitting || hasSubmitted}
              onClick={handleSubmitClick}
              style={{
                padding: '0.55rem 0.9rem',
                border: 'none',
                borderRadius: '8px',
                background: hasSubmitted ? '#16a34a' : '#3b82f6',
                opacity: isSubmitting || hasSubmitted ? 0.85 : 1,
                color: 'white',
                cursor: isSubmitting || hasSubmitted ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(59,130,246,0.15)'
              }}
            >
              {hasSubmitted ? '✅ Submitted' : (isSubmitting ? 'Submitting…' : '✔ Submit')}
            </button>
          </div>
        </div>

        {/* Main Content Area - Two Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left Column - Problem Description Panel */}
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <button
                onClick={() => setActiveTab('description')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: activeTab === 'description' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'description' ? 'white' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: activeTab === 'testcases' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'testcases' ? 'white' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Test Cases
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: activeTab === 'solution' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'solution' ? 'white' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Solution
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'description' ? (
                <div>
                  <p style={{ 
                    color: '#1e293b', 
                    lineHeight: '1.7', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    {q?.description || `Write a JavaScript code to print 'Hello World' in the console. Use console.log() function to display the message.`}
                  </p>
                  
                  {q?.testCases && (
                    <div style={{
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{
                        color: '#3b82f6',
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        📋 Test Cases:
                      </h4>
                      <pre style={{
                        color: '#475569',
                        fontSize: '0.95rem',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                        background: '#f1f5f9',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {q.testCases}
                      </pre>
                    </div>
                  )}
                  
                  {q?.expectedOutput && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: '#f0fdf4',
                      borderRadius: '10px',
                      border: '1px solid #22c55e'
                    }}>
                      <h4 style={{
                        color: '#16a34a',
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        🎯 Expected Output:
                      </h4>
                      <pre style={{
                        color: '#166534',
                        fontSize: '0.95rem',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                        background: '#f0fdf4',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #22c55e'
                      }}>
                        {q.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              ) : activeTab === 'testcases' ? (
                <div>
                  {q?.testCases ? (
                    <div>
                      <h4 style={{
                        color: '#3b82f6',
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        📋 Test Cases:
                      </h4>
                      <pre style={{
                        color: '#475569',
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                        background: '#f1f5f9',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {q.testCases}
                      </pre>
                    </div>
                  ) : (
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.95rem',
                      fontStyle: 'italic'
                    }}>
                      Test cases will be displayed here...
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {q?.solution ? (
                    <div>
                      <h4 style={{
                        color: '#3b82f6',
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        ✅ Solution (JavaScript)
                      </h4>
                      <pre style={{
                        color: '#0f172a',
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {q.solution}
                      </pre>
                    </div>
                  ) : (
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.95rem',
                      fontStyle: 'italic'
                    }}>
                      Solution will appear here when provided by the admin.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Code Editor & Output Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Code Editor */}
            <div style={{ 
              background: '#111827',
              borderRadius: '16px',
              border: '1px solid #1f2937',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                background: '#1f2937',
                borderBottom: '1px solid #374151',
                fontWeight: '600',
                color: 'white'
              }}>
                Code Editor
              </div>
              <textarea
                value={code}
                onChange={(e) => { setCode(e.target.value); setHasSubmitted(false); setLastRunSuccess(false); }}
                style={{
                  width: '100%',
                  height: '320px',
                  padding: '1.5rem',
                  border: 'none',
                  outline: 'none',
                  fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  background: '#111827',
                  color: '#e5e7eb',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Output Console */}
            <div style={{ 
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(2,6,23,0.06)'
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                Output
              </div>
              <div style={{
                padding: '1.5rem',
                minHeight: '150px',
                background: 'white',
                fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                color: '#111827',
                lineHeight: '1.7'
              }}>
                {output || "Click 'Run Code' to see output..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
