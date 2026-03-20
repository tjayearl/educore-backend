const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  courseId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  contentType: { type: String, required: true, enum: ['video', 'text', 'quiz'] },
  contentUrl: { type: String },
  contentBody: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Flexible field for Quiz questions or Video duration
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);