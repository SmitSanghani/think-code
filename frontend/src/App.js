import React, { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminSubmissionsPage from "./AdminSubmissionsPage";
import ThinkCodeHomePage from "./ThinkCodeHomePage";
import StudentDashboard from "./StudentDashboard";
import SolutionPage from "./SolutionPage";
import StudentLogin from "./StudentLogin";
import StudentProfile from "./StudentProfile";

function App() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [studentPage, setStudentPage] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAdminSubmissions, setShowAdminSubmissions] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Check if student is already logged in (from localStorage)
  useEffect(() => {
    const savedEmail = localStorage.getItem('studentEmail');
    if (savedEmail) {
      setStudentEmail(savedEmail);
      setIsStudentLoggedIn(true);
    }
  }, []);

  if (adminLoggedIn) {
    if (showAdminSubmissions) {
      return <AdminSubmissionsPage onBack={() => setShowAdminSubmissions(false)} />;
    }
    return <AdminDashboard onLogout={() => {
      setAdminLoggedIn(false);
      setShowAdminLogin(false);
    }} onOpenSubmissions={() => setShowAdminSubmissions(true)} />;
  }

  if (currentQuestion) {
    return (
      <SolutionPage
        question={currentQuestion}
        onBack={() => {
          setCurrentQuestion(null);
          // Stay in student dashboard
        }}
        studentEmail={studentEmail}
      />
    );
  }

  if (showProfile) {
    return (
      <StudentProfile
        studentEmail={studentEmail}
        onBack={() => setShowProfile(false)}
      />
    );
  }

  if (studentPage) {
    return (
      <div>
        <StudentDashboard
          onStartProblem={(q) => {
            console.log('Starting problem:', q);
            if (isStudentLoggedIn) {
              // Student already logged in, go directly to question
              setCurrentQuestion(q);
            } else {
              // New student, show login popup
              setPendingQuestion(q);
              setShowStudentLogin(true);
            }
          }}
          studentEmail={studentEmail || "student@example.com"}
          onBack={() => {
            setStudentPage(false);
            setCurrentQuestion(null);
            setShowStudentLogin(false);
            setPendingQuestion(null);
          }}
          onOpenProfile={() => setShowProfile(true)}
        />
        {showStudentLogin && (
          <div>
            {console.log('Rendering StudentLogin popup, showStudentLogin:', showStudentLogin)}
            <StudentLogin
              onLogin={(credentials) => {
                console.log('Student logged in:', credentials);
                setStudentEmail(credentials.email);
                setIsStudentLoggedIn(true); // Set student as logged in
                localStorage.setItem('studentEmail', credentials.email); // Save to localStorage
                setShowStudentLogin(false);
                setCurrentQuestion(pendingQuestion);
                setPendingQuestion(null);
              }}
              onClose={() => {
                console.log('Student login closed');
                setShowStudentLogin(false);
                setPendingQuestion(null);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {showAdminLogin && (
        <AdminLogin
          onLogin={() => setAdminLoggedIn(true)}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
      
      <ThinkCodeHomePage
        onAdminClick={() => setShowAdminLogin(true)}
        onStartCoding={() => setStudentPage(true)}
      />
    </div>
  );
}

export default App;