const Class = require('../models/Class');
const User = require('../models/User');
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

    // Check if class is still active
    const currentTime = new Date();
    if (currentTime > classRoom.endTime) {
      return res.status(400).json({ message: 'Class session has ended' });
    }

    res.json({
      classId: classRoom._id,
      subjectName: classRoom.subjectName,
      instructorName: classRoom.instructorName,
      endTime: classRoom.endTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining class', error: error.message });
  }
};

// Get class details by ID
const getClassById = async (req, res) => {
  try {
    const classRoom = await Class.findById(req.params.classId);
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class details', error: error.message });
  }
};

module.exports = {
  createClass,
  getMyClasses,
  joinClass,
  getClassById
};   
