const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  courseId: { type: Number, required: true, index: true },
  completedLessons: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedAt: { type: Date, default: Date.now }
  }],
  quizScores: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    score: { type: Number },
    totalQuestions: { type: Number },
    attemptedAt: { type: Date, default: Date.now }
  }],
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);