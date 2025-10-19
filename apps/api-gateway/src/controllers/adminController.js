const adminService = require('../services/adminService');

class AdminController {
  // Get admin dashboard
  async getDashboard(req, res) {
    try {
      const dashboard = await adminService.getDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await adminService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create user
  async createUser(req, res) {
    try {
      const userData = req.body;
      const newUser = await adminService.createUser(userData);
      
      res.status(201).json({ 
        success: true, 
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedUser = await adminService.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ 
        success: true, 
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await adminService.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get system analytics
  async getSystemAnalytics(req, res) {
    try {
      const analytics = await adminService.getSystemAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Generate report
  async generateReport(req, res) {
    try {
      const { type, period } = req.query;
      const report = await adminService.generateReport(type, period);
      
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get AI status
  async getAIStatus(req, res) {
    try {
      const status = await adminService.getAIStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Train AI model
  async trainAIModel(req, res) {
    try {
      const result = await adminService.trainAIModel();
      
      res.json({ 
        success: true, 
        data: result,
        message: 'AI model training initiated'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AdminController();


