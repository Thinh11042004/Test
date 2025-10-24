const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.get('/insights', aiController.getWorkforceInsight.bind(aiController));
router.post('/candidate-summary', aiController.summarizeCandidate.bind(aiController));
router.post('/match', aiController.matchCandidateToJob.bind(aiController));
router.post('/interview-feedback', aiController.generateInterviewFeedback.bind(aiController));

module.exports = router;