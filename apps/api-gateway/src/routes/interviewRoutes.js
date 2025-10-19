<<<<<<< ours
const express = require('express');
const interviewService = require('../services/interviewService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const interviews = await interviewService.listInterviews();
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
=======
const express = require('express');
const interviewService = require('../services/interviewService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const interviews = await interviewService.listInterviews();
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
>>>>>>> theirs
