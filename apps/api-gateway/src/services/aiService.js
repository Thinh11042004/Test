const axios = require('axios');

class AIServiceClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
      timeout: Number(process.env.AI_SERVICE_TIMEOUT || 20000)
    });
  }

  async summarizeCandidate(payload) {
    try {
      const { data } = await this.client.post('/ai/candidate-summary', payload);
      return data;
    } catch (error) {
      throw this.wrapError(error, 'Unable to summarize candidate');
    }
  }

  async evaluateMatch(payload) {
    try {
      const { data } = await this.client.post('/ai/match', payload);
      return data;
    } catch (error) {
      throw this.wrapError(error, 'Unable to evaluate candidate-job match');
    }
  }

  async generateInterviewFeedback(payload) {
    try {
      const { data } = await this.client.post('/ai/interview-feedback', payload);
      return data;
    } catch (error) {
      throw this.wrapError(error, 'Unable to generate interview feedback');
    }
  }

  async parseResume(payload) {
    try {
      const { data } = await this.client.post('/ai/parse-resume', payload);
      return data;
    } catch (error) {
      throw this.wrapError(error, 'Unable to parse resume with AI service');
    }
  }

  async health() {
    try {
      const { data } = await this.client.get('/health');
      return data;
    } catch (error) {
      throw this.wrapError(error, 'AI service health check failed');
    }
  }

  wrapError(error, fallbackMessage) {
    if (error.response) {
      const message = error.response.data?.detail || error.response.data?.error || fallbackMessage;
      return new Error(message);
    }

    if (error.code === 'ECONNREFUSED') {
      return new Error('AI service is unavailable. Please ensure the service is running.');
    }

    return new Error(fallbackMessage);
  }
}

module.exports = new AIServiceClient();
