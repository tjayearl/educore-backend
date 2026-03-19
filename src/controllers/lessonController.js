const Lesson = require('../models/Lesson');

const addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, contentType, contentUrl, contentBody, order } = req.body;

    if (!title || !contentType) {
      return res.status(400).json({ message: 'Title and content type required' });
    }

    const lesson = new Lesson({
      courseId: parseInt(courseId),
      title,
      contentType,
      contentUrl,
      contentBody,
      order: order || 0
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId: parseInt(courseId) }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lesson = await Lesson.findByIdAndUpdate(id, updates, { new: true });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addLesson,
  getLessonsByCourse,
  updateLesson,
  deleteLesson
};