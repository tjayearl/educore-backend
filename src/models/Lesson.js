const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: Number,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['text', 'video'],
    required: true
  },
  contentUrl: {
    type: String
  },
  contentBody: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);