const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get all questions
router.get('/', async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
});

// Add new question (full schema)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      difficulty,
      language,
      description,
      testCases,
      expectedOutput,
      solution,
      category,
      type,
      estimatedTime
    } = req.body || {};

    const question = new Question({
      title,
      difficulty,
      language,
      description,
      testCases,
      expectedOutput,
      solution,
      category,
      type,
      estimatedTime
    });
    await question.save();
    res.status(201).json(question);
  } catch (e) {
    res.status(500).json({ error: 'Error creating question' });
  }
});

// Update question (full schema)
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      difficulty,
      language,
      description,
      testCases,
      expectedOutput,
      solution,
      category,
      type,
      estimatedTime
    } = req.body || {};
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title,
        difficulty,
        language,
        description,
        testCases,
        expectedOutput,
        solution,
        category,
        type,
        estimatedTime
      },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (e) {
    res.status(500).json({ error: 'Error updating question' });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  res.json({ message: 'Question deleted' });
});

module.exports = router;
