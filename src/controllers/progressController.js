const UserProgress = require('../models/UserProgress');

const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    let progress = await UserProgress.findOne({ userId, courseId: parseInt(courseId) });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId: parseInt(courseId),
        completedLessons: [{ lessonId }]
      });
    } else {
      const alreadyCompleted = progress.completedLessons.some(
        cl => cl.lessonId.toString() === lessonId
      );

      if (!alreadyCompleted) {
        progress.completedLessons.push({ lessonId });
      }
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({ 
      userId, 
      courseId: parseInt(courseId) 
    }).populate('completedLessons.lessonId');

    if (!progress) {
      return res.json({ completedLessons: [] });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markLessonComplete,
  getUserProgress
};