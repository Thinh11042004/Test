const express = require('express');
const authRoutes = require('./authRoutes');
const jobRoutes = require('./jobRoutes');
const candidateRoutes = require('./candidateRoutes');
const resumeRoutes = require('./resumeRoutes');
const applicationRoutes = require('./applicationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/candidates', candidateRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;