<<<<<<< ours
const candidateService = require('../services/candidateService');

class CandidateController {
  async getAllCandidates(req, res) {
    try {
      const candidates = await candidateService.listCandidates({
        search: req.query.search,
        status: req.query.status,
        skills: req.query.skills
      });

      res.json({ success: true, data: candidates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCandidateById(req, res) {
    try {
      const candidate = await candidateService.getCandidateById(req.params.id);

      if (!candidate) {
        return res.status(404).json({ success: false, error: 'Candidate not found' });
      }

      res.json({ success: true, data: candidate });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createCandidate(req, res) {
    try {
      const candidate = await candidateService.createCandidate(req.body);

      res.status(201).json({
        success: true,
        data: candidate,
        message: 'Candidate created successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateCandidate(req, res) {
    try {
      const candidate = await candidateService.updateCandidate(req.params.id, req.body);

      if (!candidate) {
        return res.status(404).json({ success: false, error: 'Candidate not found' });
      }

      res.json({ success: true, data: candidate, message: 'Candidate updated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteCandidate(req, res) {
    try {
      await candidateService.deleteCandidate(req.params.id);
      res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async uploadResume(req, res) {
    try {
      const candidate = await candidateService.uploadResume(req.params.id, req.body);
      res.json({ success: true, data: candidate });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getCandidateJobs(req, res) {
    try {
      const jobs = await candidateService.getCandidateJobs(req.params.id);
      res.json({ success: true, data: jobs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async parseCV(req, res) {
    try {
      const parsedData = await candidateService.parseCV(req.params.id, req.body.cvText);
      res.json({ success: true, data: parsedData });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getCandidateAnalytics(req, res) {
    try {
      const analytics = await candidateService.getCandidateAnalytics(req.params.id);
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CandidateController();
=======
const employeeService = require('../services/employeeService');

class EmployeeController {
  async list(req, res) {
    try {
      const employees = await employeeService.listEmployees({
        search: req.query.search,
        departmentId: req.query.departmentId
      });
      res.json({ success: true, data: employees });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async get(req, res) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      res.json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      res.json({ success: true, data: employee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async remove(req, res) {
    try {
      await employeeService.deleteEmployee(req.params.id);
      res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async performance(req, res) {
    try {
      const performance = await employeeService.getEmployeePerformance(req.params.id);
      if (!performance) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      res.json({ success: true, data: performance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new EmployeeController();
>>>>>>> theirs
