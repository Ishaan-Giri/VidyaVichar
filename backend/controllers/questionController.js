const Question = require('../models/Question');
const Class = require('../models/Class');

// @desc    Create new question
// @route   POST /api/questions
// @access  Public
const createQuestion = async (req, res) => {
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

    // Check for duplicate question in the same class
    const existingQuestion = await Question.findOne({ text: text.trim(), classId });
    if (existingQuestion) {
      return res.status(400).json({ message: 'This question has already been asked in this class' });
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
    res.status(500).json({ message: 'Error posting question', error: error.message });
  }
};

// @desc    Get questions for a class
// @route   GET /api/questions/class/:classId
// @access  Public
const getQuestions =  async (req, res) => {
  try {
    const classRoom = await Class.findById(req.params.classId);
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const questions = await Question.find({ classId: req.params.classId })
      .populate('classId', 'subjectName instructorName')
      .sort({ createdAt: -1 });

    const isPast = new Date() > new Date(classRoom.endTime);

    let analytics = null;
    if (isPast) {
      const totalQuestions = questions.length;
      const answered = questions.filter(q => q.status === 'answered').length;
      const important = questions.filter(q => q.status === 'important').length;
      const unanswered = totalQuestions - answered;

      analytics = { totalQuestions, answered, unanswered, important };
    }

    res.json({ questions, isPast, analytics });
  } catch (error) {
    console.error('Error fetching questions for student view:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

// @desc    Get questions for a class for instructor review
// @route   GET /api/questions/for-class/:classId
// @access  Private (Instructor)
const getQuestionsForClass = async (req, res) => {
  try {
    // First, verify the class belongs to the instructor making the request
    const classRoom = await Class.findOne({ _id: req.params.classId, instructorId: req.user._id });
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found or you do not have permission to view it.' });
    }

    const { status } = req.query;
    let filter = { classId: req.params.classId };

    if (status && status === 'archived') {
      filter.status = 'archived';
    } else if (status && status !== 'all') {
      filter.status = status;
    } else if (status !== 'archived') {
      // Default view for instructor excludes archived unless explicitly requested
      filter.status = { $ne: 'archived' };
    }
    
    // If class is found and verified, fetch the questions
    const questions = await Question.find(filter)
      .sort({ createdAt: 'desc' });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions for instructor:', error);
    res.status(500).json({ message: 'Error fetching questions for class', error: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const updateQuestionStatus =  async (req, res) => {
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
    // Instead of deleting, we update the status to 'archived'
    await Question.updateMany(
      { classId: req.params.classId, status: { $ne: 'archived' } },
      { $set: { status: 'archived' } }
    );
    res.json({ message: 'All questions have been archived.' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing questions', error: error.message });
  }
};
module.exports = {
  createQuestion,
  getQuestions,
  updateQuestionStatus,
  updateQuestion,
  deleteQuestion,
  clearQuestions,
  getQuestionsForClass
};