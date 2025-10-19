const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createApplication,
  updateApplication,
  listByJob,
  rankingForJob,
  listMine
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/', authenticate, authorize('CANDIDATE', 'HR', 'ADMIN'), asyncHandler(createApplication));
router.patch('/:id', authenticate, authorize('HR', 'ADMIN'), asyncHandler(updateApplication));
router.get('/by-job/:jobId', authenticate, authorize('HR', 'ADMIN'), asyncHandler(listByJob));
router.get('/ranking/:jobId', authenticate, authorize('HR', 'ADMIN'), asyncHandler(rankingForJob));
router.get('/mine', authenticate, asyncHandler(listMine));

module.exports = router;