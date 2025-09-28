const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  duration: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

classSchema.pre('save', function(next) {
  if (this.isNew) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);