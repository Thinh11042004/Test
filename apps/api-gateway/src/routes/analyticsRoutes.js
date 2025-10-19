<<<<<<< ours
const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.get('/insights', aiController.getWorkforceInsight.bind(aiController));
router.post('/candidate-summary', aiController.summarizeCandidate.bind(aiController));
router.post('/match', aiController.matchCandidateToJob.bind(aiController));
router.post('/interview-feedback', aiController.generateInterviewFeedback.bind(aiController));

module.exports = router;
=======
const express = require('express');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const analytics = await analyticsService.getOrgAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
>>>>>>> theirs
