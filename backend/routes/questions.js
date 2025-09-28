const express = require('express');
const { createQuestion, getQuestions, getQuestionsForClass, updateQuestionStatus, clearQuestions } = require('../controllers/questionController');
const auth = require('../middleware/auth');


const router = express.Router();

// Post a question (Student)
router.post('/post', createQuestion);

// Get questions for a class (Student)
router.get('/class/:classId', getQuestions);

// Get questions for a class (Instructor Review)
router.get('/for-class/:classId', auth, getQuestionsForClass);

// Update question status (Instructor)
router.patch('/:questionId/status', auth, updateQuestionStatus);

// Delete all questions for a class (Clear board)
router.delete('/class/:classId/clear', auth, clearQuestions);

module.exports = router;