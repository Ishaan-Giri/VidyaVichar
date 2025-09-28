const express = require('express');
const Question = require('../models/Question');
const Class = require('../models/Class');
const { createQuestion, getQuestions,updateQuestionStatus, clearQuestions } = require('../controllers/questionController');
const { get } = require('mongoose');


const router = express.Router();

// Post a question (Student)
router.post('/post', createQuestion);

// Get questions for a class
router.get('/class/:classId',getQuestions);

// Update question status (Instructor)
router.patch('/:questionId/status',updateQuestionStatus);

// Delete all questions for a class (Clear board)
router.delete('/class/:classId/clear',clearQuestions );

module.exports = router;