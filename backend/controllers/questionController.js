const Question = require('../models/Question');
const Class = require('../models/Class');

// @desc    Create new question
// @route   POST /api/questions
// @access  Public
const createQuestion = async (req, res) => {
  try {
    const { text, classId, author } = req.body;

    // Check if class exists and is active
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const currentTime = new Date();
    if (currentTime > classData.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Class session has ended'
      });
    }

    // Generate random color for sticky note
    const colors = ['#FFE135', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const question = await Question.create({
      text: text.trim(),
      classId,
      author: author || 'Anonymous Student',
      color
    });

    await question.populate('classId', 'subjectName instructorName');

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This question has already been asked in this class'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get questions for a class
// @route   GET /api/questions/class/:classId
// @access  Public
const getQuestions = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { classId: req.params.classId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const questions = await Question.find(filter)
      .populate('classId', 'subjectName instructorName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('classId', 'subjectName instructorName');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update question status
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('classId', 'subjectName instructorName');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear all questions for a class
// @route   DELETE /api/questions/class/:classId/clear
// @access  Private
const clearQuestions = async (req, res) => {
  try {
    await Question.deleteMany({ classId: req.params.classId });

    res.status(200).json({
      success: true,
      message: 'All questions cleared successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  clearQuestions
};