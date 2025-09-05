require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());


// Simple request logger to debug 404s
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Healthcheck
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
  console.log(`🔗 Database: ${mongoose.connection.name}`);
  console.log(`🌍 Host: ${mongoose.connection.host}`);
  // Backfill: ensure all Question docs have a 'solution' field
  (async () => {
    try {
      const res = await Question.updateMany({ solution: { $exists: false } }, { $set: { solution: "" } });
      if (res?.modifiedCount) {
        console.log(`🛠️ Backfilled 'solution' on ${res.modifiedCount} question(s).`);
      }
    } catch (e) {
      console.warn('Backfill for solution field failed:', e.message);
    }
  })();
})
.catch((error) => {
  console.error('❌ MongoDB connection failed!');
  console.error('🔍 Error details:', error.message);
  console.error('💡 Check your MONGODB_URI in .env file');
  console.error('💡 Make sure your MongoDB Atlas cluster is running');
  console.error('💡 Verify your IP address is whitelisted');
  process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  console.error('🔴 MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB connection disconnected');
});

const Admin = require('./models/Admin');
const Question = require('./models/Question');
const Submission = require('./models/Submission');
const Student = require('./models/Student');
const Registration = require('./models/registration');

// Optional email support
let nodemailer = null;
try {
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
  // eslint-disable-next-line no-empty
} catch (e) {}

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

// Raw registration capture API (saves to Registration collection)
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

// List captured registrations (admin/debug)
app.get(['/api/registration', '/registration'], async (_req, res) => {
  try {
    const list = await Registration.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update student name by email
app.put(['/api/students/name', '/students/name'], async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email || !name) return res.status(400).json({ error: 'Missing email or name' });
    const updated = await Student.findOneAndUpdate({ email }, { name }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Updated', student: { _id: updated._id, email: updated.email, name: updated.name } });
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

// Auth middleware for protected routes (students)
function requireStudentAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.auth = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Example protected route for student profile
app.get(['/api/students/me', '/students/me'], requireStudentAuth, async (req, res) => {
  const student = await Student.findById(req.auth.sid, { password: 0 });
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

app.get(['/api/students', '/students'], async (_req, res) => {
  try {
    const list = await Student.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get(['/api/students/count', '/students/count'], async (_req, res) => {
  try {
    const c = await Student.countDocuments();
    res.json({ count: c });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a student by email AND their submissions
app.delete(['/api/students/by-email', '/students/by-email'], async (req, res) => {
  try {
    const email = req.query.email || req.body?.email;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const studentDel = await Student.deleteOne({ email });
    const subsDel = await Submission.deleteMany({ studentEmail: email });
    res.json({ deletedStudent: studentDel.deletedCount || 0, deletedSubmissions: subsDel.deletedCount || 0 });
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

// Get single question by ID (includes solution)
app.get('/api/questions/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching question' });
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

// Update only the solution field for a question (useful for existing docs missing the field)
app.put('/api/questions/:id/solution', async (req, res) => {
  try {
    const { solution } = req.body || {};
    if (typeof solution !== 'string') {
      return res.status(400).json({ error: 'solution must be a string' });
    }
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { solution },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Error updating solution' });
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

// Utility to compute a simple grade string based on problem difficulty
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

// Save or update submission (enforce one per student per question), only allow correct ones
app.post(['/api/submissions', '/submissions'], async (req, res) => {
  try {
    const { studentEmail, questionId, questionTitle, language, code, output, isCorrect, difficulty } = req.body;
    if (!studentEmail || !questionTitle || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isCorrect) {
      return res.status(400).json({ error: 'Only correct answers can be submitted' });
    }

    // Attach studentId if available
    let studentId = null;
    try {
      const student = await Student.findOne({ email: studentEmail });
      if (student) studentId = student._id;
    } catch (_) {}

    const grade = computeGrade(difficulty);

    // Upsert: one submission per (studentEmail, questionId)
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

    // Send email if nodemailer and SMTP env are configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    if (nodemailer && SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FROM_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        await transporter.sendMail({
          from: FROM_EMAIL,
          to: studentEmail,
          subject: `Submission Received: ${questionTitle}`,
          text: `Hi,\n\nYour correct answer has been recorded.\n\nQuestion: ${questionTitle}\nGrade: ${grade}\n\nThanks,\nThinkCode`,
        });
      } catch (mailError) {
        // Log but do not fail the submission
        console.error('Email send failed:', mailError.message);
      }
    }

    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error) {
    res.status(500).json({ error: 'Error saving submission' });
  }
});

// Delete ALL submissions (admin maintenance)
app.delete(['/api/submissions', '/submissions'], async (_req, res) => {
  try {
    const result = await Submission.deleteMany({});
    res.json({ deleted: result.deletedCount || 0 });
  } catch (e) {
    res.status(500).json({ error: 'Error deleting submissions' });
  }
});

// Delete submissions by student
app.delete(['/api/submissions/by-student', '/submissions/by-student'], async (req, res) => {
  try {
    const { studentEmail } = req.query;
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail is required' });
    const result = await Submission.deleteMany({ studentEmail });
    res.json({ deleted: result.deletedCount || 0 });
  } catch (e) {
    res.status(500).json({ error: 'Error deleting submissions by student' });
  }
});

// Get student stats
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

// List all submissions for admin or filter by studentEmail for students
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

// Grade a submission
app.put(['/api/submissions/:id/grade', '/submissions/:id/grade'], async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, isAdminGraded: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found' });

    // Optionally email student about grade
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    if (nodemailer && SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FROM_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: updated.studentEmail,
          subject: `Grade Updated: ${updated.questionTitle}`,
          text: `Hi,\n\nYour grade has been updated.\nQuestion: ${updated.questionTitle}\nGrade: ${updated.grade || 'N/A'}\n\nFeedback:\n${feedback || 'No feedback'}\n\nThanks,\nThinkCode`,
        });
      } catch (e) {
        console.error('Email send failed:', e.message);
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating grade' });
  }
});

// Aggregate: solved counts per student (only correct submissions)
app.get(['/api/stats/students', '/stats/students'], async (req, res) => {
  try {
    const agg = await Submission.aggregate([
      { $match: { isCorrect: true } },
      { $group: { _id: '$studentEmail', solvedCount: { $sum: 1 } } },
      { $project: { _id: 0, studentEmail: '$_id', solvedCount: 1 } },
      { $sort: { solvedCount: -1, studentEmail: 1 } }
    ]);
    res.json(agg);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student stats' });
  }
});

// Initialize default questions
async function initializeDefaultQuestions() {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      const defaultQuestions = [
        {
          title: "Print Hello World",
          difficulty: "Easy",
          language: "JavaScript",
          description: "Write a JavaScript code to print 'Hello World' in the console. Use console.log() function to display the message.",
          testCases: "No input required\nExpected Output: Hello World",
          expectedOutput: "Hello World",
          solution: "console.log('Hello World');",
          category: "Basics",
          type: "Print Statement",
          estimatedTime: "5-10 min"
        },
        {
          title: "Calculate Sum of Numbers",
          difficulty: "Easy",
          language: "JavaScript",
          description: "Write a function that takes an array of numbers and returns the sum of all numbers. Example: sum([1, 2, 3, 4, 5]) should return 15.",
          testCases: "Input: [1, 2, 3, 4, 5]\nExpected Output: 15\n\nInput: [10, 20, 30]\nExpected Output: 60",
          expectedOutput: "15",
          solution: "function sum(arr){ return arr.reduce((a,b)=>a+b,0); }",
          category: "Basics",
          type: "Array Operations",
          estimatedTime: "10-15 min"
        },
        {
          title: "Check Even or Odd",
          difficulty: "Easy",
          language: "JavaScript",
          description: "Write a function that takes a number and returns 'Even' if the number is even, or 'Odd' if the number is odd.",
          testCases: "Input: 4\nExpected Output: Even\n\nInput: 7\nExpected Output: Odd\n\nInput: 0\nExpected Output: Even",
          expectedOutput: "Even",
          solution: "function evenOdd(n){ return n%2===0 ? 'Even' : 'Odd'; }",
          category: "Basics",
          type: "Conditional Logic",
          estimatedTime: "10-15 min"
        }
      ];
      
      await Question.insertMany(defaultQuestions);
      console.log('✅ Default questions added to MongoDB Atlas!');
    } else {
      console.log('✅ Questions already exist in database');
    }
  } catch (error) {
    console.log('❌ Error initializing questions:', error.message);
  }
}

const PORT = process.env.PORT || 5000;

// Start server with better error handling
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📊 MongoDB status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  
  // Initialize default questions after server starts
  initializeDefaultQuestions();
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Try using a different port or kill the process using port ${PORT}`);
    console.error(`💡 You can also change PORT in .env file`);
  } else {
    console.error(`❌ Server error:`, error.message);
  }
  process.exit(1);
}); 