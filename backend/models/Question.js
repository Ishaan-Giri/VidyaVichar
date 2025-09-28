// ===== backend/models/Question.js =====
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  author: {
    type: String,
    default: 'Anonymous Student'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  status: {
    type: String,
    enum: ['unanswered', 'answered', 'important'],
    default: 'unanswered'
  },
  color: {
    type: String,
    default: '#FFE135' // Default sticky note color
  }
}, {
  timestamps: true
});

// Prevent duplicate questions in the same class
questionSchema.index({ text: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);