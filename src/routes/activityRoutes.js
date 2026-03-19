const express = require('express');
const { getAllActivities, getUserActivities } = require('../controllers/activityController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Admin can view all activities
router.get('/all', authMiddleware, adminOnly, getAllActivities);

// Users can view their own activities
router.get('/my-activities', authMiddleware, getUserActivities);

module.exports = router;