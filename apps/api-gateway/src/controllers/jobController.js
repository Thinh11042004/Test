const jobService = require('../services/jobService');

class JobController {
  // Get all jobs
  async getAllJobs(req, res) {
    try {
      const { status, department, level, page = 1, limit = 10 } = req.query;
      const jobs = await jobService.getAllJobs({ status, department, level, page, limit });
      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jobs.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get job by ID
  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await jobService.getJobById(id);
      
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      
      res.json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create new job
  async createJob(req, res) {
    try {
      const jobData = req.body;
      const newJob = await jobService.createJob(jobData);
      
      res.status(201).json({ 
        success: true, 
        data: newJob,
        message: 'Job created successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Update job
  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedJob = await jobService.updateJob(id, updateData);
      
      if (!updatedJob) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      
      res.json({ 
        success: true, 
        data: updatedJob,
        message: 'Job updated successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete job
  async deleteJob(req, res) {
    try {
      const { id } = req.params;
      const deleted = await jobService.deleteJob(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Job deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get candidates for a job
  async getJobCandidates(req, res) {
    try {
      const { id } = req.params;
      const candidates = await jobService.getJobCandidates(id);
      
      res.json({ success: true, data: candidates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Apply to job
  async applyToJob(req, res) {
    try {
      const { id } = req.params;
      const applicationData = req.body;
      const application = await jobService.applyToJob(id, applicationData);
      
      res.status(201).json({ 
        success: true, 
        data: application,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get job matches (AI-powered)
  async getJobMatches(req, res) {
    try {
      const { id } = req.params;
      const matches = await jobService.getJobMatches(id);
      
      res.json({ success: true, data: matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get job analytics
  async getJobAnalytics(req, res) {
    try {
      const { id } = req.params;
      const analytics = await jobService.getJobAnalytics(id);
      
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new JobController();

