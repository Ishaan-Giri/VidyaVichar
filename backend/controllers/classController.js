const Class = require('../models/Class');
const User = require('../models/User');
const Question = require('../models/Question');
const generateAccessCode = require('../utils/generateAccessCode');

// Create a new class (Instructor only)
const createClass = async (req, res) => {
  try {
    const { subjectName, instructorName, duration } = req.body;

    let accessCode;
    let isUnique = false;

    // Generate unique access code
    while (!isUnique) {
      accessCode = generateAccessCode();
      const existingClass = await Class.findOne({ accessCode });
      if (!existingClass) {
        isUnique = true;
      }
    }

    const newClass = new Class({
      subjectName,
      instructorName,
      instructorId: req.user._id,
      accessCode,
      duration
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

// Get instructor's classes
const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ instructorId: req.user._id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// Join class by access code (Student)
const joinClass = async (req, res) => {
  try {
    const { accessCode } = req.body;

    const classRoom = await Class.findOne({ accessCode });
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const endTime = new Date(classRoom.startTime.getTime() + classRoom.duration * 60000);
    const isPast = new Date() > endTime;

    let analytics = null;
    if (isPast) {
      const allQuestions = await Question.find({ classId: classRoom._id });
      const totalQuestions = allQuestions.length;
      const answered = allQuestions.filter(q => q.status === 'answered').length;
      const important = allQuestions.filter(q => q.status === 'important').length;
      const unanswered = totalQuestions - answered;

      analytics = { totalQuestions, answered, unanswered, important };
    }

    res.json({
      classId: classRoom._id,
      subjectName: classRoom.subjectName,
      instructorName: classRoom.instructorName,
      endTime: endTime,
      isPast: isPast,
      analytics: analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining class', error: error.message });
  }
};

// Get class details by ID
const getClassById = async (req, res) => {
  try {
    const classRoom = await Class.findById(req.params.id);
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class details', error: error.message });
  }
};

// End a class manually (Instructor only)
const endClass = async (req, res) => {
  try {
    const classRoom = await Class.findOne({ _id: req.params.classId, instructorId: req.user._id });

    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found or you are not the instructor.' });
    }

    // Prevent ending a class that is already over
    if (new Date() > new Date(classRoom.endTime)) {
        return res.status(400).json({ message: 'This class has already ended.' });
    }

    classRoom.endTime = new Date(); // Set end time to now
    classRoom.isActive = false;

    await classRoom.save();

    res.json({ message: 'Class ended successfully.', class: classRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error ending class', error: error.message });
  }
};

module.exports = {
  createClass,
  getMyClasses,
  joinClass,
  getClassById,
  endClass
};
