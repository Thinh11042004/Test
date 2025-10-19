const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const { presign, createResume, getResume } = require('../controllers/resumeController');

const router = express.Router();

router.post('/presign', authenticate, authorize('CANDIDATE', 'HR', 'ADMIN'), asyncHandler(presign));
router.post('/', authenticate, authorize('CANDIDATE', 'HR', 'ADMIN'), asyncHandler(createResume));
router.get('/:id', authenticate, asyncHandler(getResume));

module.exports = router;