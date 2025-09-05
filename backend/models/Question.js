const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String,
  difficulty: String,
  language: String,
  description: String,
  testCases: String,
  expectedOutput: String,
  // Solution/explanation that admin provides; must be non-empty
  solution: { type: String, required: true, trim: true, minlength: 1 },
  category: String,
  type: String,
  estimatedTime: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
