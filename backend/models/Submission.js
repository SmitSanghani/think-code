const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionTitle: { type: String, required: true },
  language: { type: String, default: 'JavaScript' },
  code: { type: String, required: true },
  output: { type: String },
  isCorrect: { type: Boolean, default: false },
  grade: { type: String },
  // Marks whether an admin explicitly graded this submission
  isAdminGraded: { type: Boolean, default: false },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);


