const Class = require('../models/Class');
const User = require('../models/User');

const ACCESS_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateAccessCode = () => {
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += ACCESS_CODE_CHARS.charAt(Math.floor(Math.random() * ACCESS_CODE_CHARS.length));
    }
    return result;
};

const createClass = async (req, res) => {
    try {
        const { subjectName, durationInMinutes } = req.body;

        if (!subjectName || !durationInMinutes || durationInMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject name and valid duration (in minutes) are required'
            });
        }

        let accessCode;
        let isUnique = false;
        while (!isUnique) {
            accessCode = generateAccessCode();
            const existingClass = await Class.findOne({ accessCode });
            if (!existingClass) isUnique = true;
        }

        const instructor = await User.findById(req.user._id).select('username');
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);

        const classData = await Class.create({
            subjectName,
            instructorId: req.user._id,
            instructorName: instructor.username,
            accessCode,
            durationInMinutes,
            startTime,
            endTime
        });

        res.status(201).json({
            success: true,
            data: classData
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating class'
        });
    }
};

const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ instructorId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching classes'
        });
    }
};

const joinClass = async (req, res) => {
    try {
        const { accessCode } = req.body;

        if (!accessCode) {
            return res.status(400).json({
                success: false,
                message: 'Access code is required'
            });
        }

        const classData = await Class.findOne({ accessCode });

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

        res.status(200).json({
            success: true,
            data: {
                classId: classData._id,
                subjectName: classData.subjectName,
                instructorName: classData.instructorName,
                endTime: classData.endTime
            }
        });
    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while joining class'
        });
    }
};

const getClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findById(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            data: classData
        });
    } catch (error) {
        console.error('Get class error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while fetching class'
        });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findById(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        if (classData.instructorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to delete this class'
            });
        }

        await classData.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete class error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while deleting class'
        });
    }
};

module.exports = {
    createClass,
    getClasses,
    joinClass,
    getClass,
    deleteClass
};   