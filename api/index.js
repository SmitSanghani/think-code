const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
})
.catch((error) => {
  console.error('❌ MongoDB connection failed!', error.message);
});

// Import models
const Admin = require('../backend/models/Admin');
const Question = require('../backend/models/Question');
const Submission = require('../backend/models/Submission');
const Student = require('../backend/models/Student');
const Registration = require('../backend/models/registration');

// Healthcheck
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ aid: String(admin._id), email: admin.email, role: 'admin' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Students API (enhanced): register, login (with JWT), list, count
app.post(['/api/students/register', '/students/register'], async (req, res) => {
  try {
    const { email, password, name, username, phone, gender } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    const exists = await Student.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    if (username) {
      const userExists = await Student.findOne({ username });
      if (userExists) return res.status(409).json({ error: 'Username already taken' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const derivedName = (name && String(name).trim()) || String(email).split('@')[0];
    const student = new Student({ email, password: hashed, name: derivedName, username, phone, gender });
    await student.save();
    res.status(201).json({ message: 'Registered', student: { _id: student._id, email: student.email, name: student.name, username: student.username, phone: student.phone, gender: student.gender } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post(['/api/students/login', '/students/login'], async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    const student = await Student.findOne(email ? { email } : { username });
    if (!student) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sid: String(student._id), email: student.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, student: { _id: student._id, email: student.email, name: student.name, username: student.username } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Registration API
app.post(['/api/registration', '/registration'], async (req, res) => {
  try {
    const { fullName, username, email, phone, gender, password, confirmPassword } = req.body || {};
    if (!fullName || !username || !email || !phone || !gender || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const exists = await Registration.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Email or username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const doc = new Registration({ fullName, username, email, phone, gender, password: hashed });
    await doc.save();

    res.status(201).json({ message: 'Registration saved', id: doc._id });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Questions API endpoints
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Error creating question' });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Error updating question' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting question' });
  }
});

// Submissions API
app.post(['/api/submissions', '/submissions'], async (req, res) => {
  try {
    const { studentEmail, questionId, questionTitle, language, code, output, isCorrect, difficulty } = req.body;
    if (!studentEmail || !questionTitle || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isCorrect) {
      return res.status(400).json({ error: 'Only correct answers can be submitted' });
    }

    let studentId = null;
    try {
      const student = await Student.findOne({ email: studentEmail });
      if (student) studentId = student._id;
    } catch (_) {}

    const grade = computeGrade(difficulty);

    const filter = { studentEmail, questionId };
    const update = {
      studentEmail,
      studentId,
      questionId,
      questionTitle,
      language,
      code,
      output,
      isCorrect: true,
      grade,
      isAdminGraded: false,
      submittedAt: new Date()
    };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const submission = await Submission.findOneAndUpdate(filter, update, options);

    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error) {
    res.status(500).json({ error: 'Error saving submission' });
  }
});

app.get(['/api/submissions', '/submissions'], async (req, res) => {
  try {
    const { studentEmail } = req.query;
    let filter = {};
    if (studentEmail) {
      filter.studentEmail = studentEmail;
    }
    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

app.put(['/api/submissions/:id/grade', '/submissions/:id/grade'], async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, isAdminGraded: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating grade' });
  }
});

// Student stats
app.get('/api/students/:email/stats', async (req, res) => {
  try {
    const email = req.params.email;
    const submissions = await Submission.find({ studentEmail: email, isCorrect: true }).sort({ submittedAt: -1 });
    const solvedCount = submissions.length;
    const recentGrade = submissions[0]?.grade || null;
    res.json({ solvedCount, recentGrade, submissions });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student stats' });
  }
});

// Utility function
function computeGrade(difficulty) {
  switch ((difficulty || '').toLowerCase()) {
    case 'hard':
      return 'A+';
    case 'medium':
      return 'A';
    case 'easy':
      return 'B+';
    default:
      return 'B';
  }
}

module.exports = app;
