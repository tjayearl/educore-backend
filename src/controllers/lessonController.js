import Lesson from '../models/Lesson.js';
import { isValidUrl } from '../utils/validation.js';

export const addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, contentType, contentUrl, contentBody, order, metadata } = req.body;

    // Validation
    if (!title || !contentType) {
      return res.status(400).json({ message: 'Title and content type are required' });
    }

    if (contentType === 'video' && (!contentUrl || !isValidUrl(contentUrl))) {
      return res.status(400).json({ message: 'Valid video URL is required for video lessons' });
    }

    if ((contentType === 'text' || contentType === 'quiz') && !contentBody && !metadata) {
      return res.status(400).json({ message: 'Content body or metadata is required for text/quiz lessons' });
    }

    const newLesson = new Lesson({
      courseId: parseInt(courseId),
      title,
      contentType,
      contentUrl,
      contentBody,
      metadata,
      order: order || 0
    });

    const savedLesson = await newLesson.save();
    res.status(201).json(savedLesson);
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId: parseInt(courseId) }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      id, 
      { $set: updateData },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(updatedLesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLesson = await Lesson.findByIdAndDelete(id);
    
    if (!deletedLesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};