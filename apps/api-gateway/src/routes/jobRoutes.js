const express = require('express');
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Job CRUD operations
router.get('/', jobController.getAllJobs.bind(jobController));
router.get('/:id', jobController.getJobById.bind(jobController));
router.post('/', requireAuth, jobController.createJob.bind(jobController));
router.put('/:id', requireAuth, jobController.updateJob.bind(jobController));
router.delete('/:id', requireAuth, jobController.deleteJob.bind(jobController));

// Job-specific operations
router.get('/:id/candidates', jobController.getJobCandidates.bind(jobController));
router.post('/:id/apply', jobController.applyToJob.bind(jobController));
router.get('/:id/matches', jobController.getJobMatches.bind(jobController));

// Job analytics
router.get('/:id/analytics', jobController.getJobAnalytics.bind(jobController));

module.exports = router;
