const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin dashboard
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// System management
router.get('/users', adminController.getAllUsers.bind(adminController));
router.post('/users', requireAuth, adminController.createUser.bind(adminController));
router.put('/users/:id', requireAuth, adminController.updateUser.bind(adminController));
router.delete('/users/:id', requireAuth, adminController.deleteUser.bind(adminController));

// System analytics
router.get('/analytics', adminController.getSystemAnalytics.bind(adminController));
router.get('/reports', requireAuth, adminController.generateReport.bind(adminController));

// AI management
router.get('/ai/status', adminController.getAIStatus.bind(adminController));
router.post('/ai/train', requireAuth, adminController.trainAIModel.bind(adminController));

module.exports = router;
