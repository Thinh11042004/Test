const express = require('express');
const candidateController = require('../controllers/candidateController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Candidate CRUD operations
router.get('/', candidateController.getAllCandidates.bind(candidateController));
router.get('/:id', candidateController.getCandidateById.bind(candidateController));
router.post('/', requireAuth, candidateController.createCandidate.bind(candidateController));
router.put('/:id', requireAuth, candidateController.updateCandidate.bind(candidateController));
router.delete('/:id', requireAuth, candidateController.deleteCandidate.bind(candidateController));

// Candidate-specific operations
router.post('/:id/upload-resume', requireAuth, candidateController.uploadResume.bind(candidateController));
router.get('/:id/jobs', candidateController.getCandidateJobs.bind(candidateController));
router.post('/:id/parse-cv', requireAuth, candidateController.parseCV.bind(candidateController));

// Candidate analytics
router.get('/:id/analytics', candidateController.getCandidateAnalytics.bind(candidateController));

module.exports = router;
