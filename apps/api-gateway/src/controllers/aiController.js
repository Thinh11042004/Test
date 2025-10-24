const aiService = require('../services/aiService');
const analyticsService = require('../services/analyticsService');
const candidateService = require('../services/candidateService');
const jobService = require('../services/jobService');

class AIController {
  async getWorkforceInsight(req, res) {
    try {
      const insight = await analyticsService.getWorkforceInsight();
      res.json({ success: true, data: insight });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async summarizeCandidate(req, res) {
    try {
      const candidate = await candidateService.getCandidateById(req.body.candidateId);
      if (!candidate) {
        return res.status(404).json({ success: false, error: 'Candidate not found' });
      }

      const summary = await aiService.summarizeCandidate({
        candidate,
        job: req.body.job || null,
        narrativeFocus: req.body.narrativeFocus || 'career',
        language: req.body.language || 'vi'
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async matchCandidateToJob(req, res) {
    try {
      const result = await jobService.matchCandidateToJob({
        jobId: req.body.jobId,
        candidateId: req.body.candidateId
      });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async generateInterviewFeedback(req, res) {
    try {
      const feedback = await aiService.generateInterviewFeedback(req.body);
      res.json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AIController();