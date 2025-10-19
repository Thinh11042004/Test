import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (AUTH_TOKEN) {
      config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }

    if (config.method && config.url) {
      console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const hrApi = {
  // Employee endpoints
  getEmployees: () => api.get('/employees'),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  getEmployeePerformance: (id) => api.get(`/employees/${id}/performance`),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // Candidate endpoints
  getCandidates: (params) => api.get('/candidates', { params }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
  createCandidate: (data) => api.post('/candidates', data),
  updateCandidate: (id, data) => api.put(`/candidates/${id}`, data),
  deleteCandidate: (id) => api.delete(`/candidates/${id}`),
  uploadCandidateResume: (id, data) => api.post(`/candidates/${id}/upload-resume`, data),
  parseCandidateCv: (id, data) => api.post(`/candidates/${id}/parse-cv`, data),

  // Job endpoints
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),

  // Interview endpoints
  getInterviews: () => api.get('/interviews'),

  // Analytics endpoints
  getAnalytics: () => api.get('/analytics'),
  getJobAnalytics: (id) => api.get(`/jobs/${id}/analytics`),
  getCandidateAnalytics: (id) => api.get(`/candidates/${id}/analytics`),

  // AI endpoints
  getWorkforceInsight: () => api.get('/ai/insights'),
  summarizeCandidate: (data) => api.post('/ai/candidate-summary', data),
  matchCandidateToJob: (data) => api.post('/ai/match', data),
  generateInterviewFeedback: (data) => api.post('/ai/interview-feedback', data),
};

export default api;
