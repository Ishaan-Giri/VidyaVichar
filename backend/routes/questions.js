const express = require('express');
const Question = require('../models/Question');
const Class = require('../models/Class');

const router = express.Router();

// Post a question (Student)
router.post('/post', async (req, res) => {
  try {
    const { text, classId, author } = req.body;

    // Check if class exists and is active
    const classRoom = await Class.findById(classId);
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const currentTime = new Date();
    if (currentTime > classRoom.endTime) {
      return res.status(400).json({ message: 'Class session has ended' });
    }

    // Generate random color for sticky note
    const colors = ['#FFE135', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const question = new Question({
      text: text.trim(),
      classId,
      author: author || 'Anonymous Student',
      color
    });

    await question.save();
    await question.populate('classId', 'subjectName instructorName');
    
    res.status(201).json(question);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This question has already been asked in this class' });
    }
    res.status(500).json({ message: 'Error posting question', error: error.message });
  }
});

// Get questions for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { classId: req.params.classId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const questions = await Question.find(filter)
      .populate('classId', 'subjectName instructorName')
      .sort({ createdAt: -1 });
    
    // Add logging to debug
    console.log('Fetched questions:', questions.length);
    console.log('Sample question:', questions[0]);
    
    // Ensure all questions have required fields
    const validQuestions = questions.filter(q => q && q._id && q.text);
    
    res.json(validQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Update question status (Instructor)
router.patch('/:questionId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      { status },
      { new: true }
    ).populate('classId', 'subjectName instructorName');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error updating question status', error: error.message });
  }
});

// Delete all questions for a class (Clear board)
router.delete('/class/:classId/clear', async (req, res) => {
  try {
    await Question.deleteMany({ classId: req.params.classId });
    res.json({ message: 'All questions cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing questions', error: error.message });
  }
});

module.exports = router;