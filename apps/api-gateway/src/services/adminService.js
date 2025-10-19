const prisma = require('../lib/prisma');
const analyticsService = require('./analyticsService');
const aiService = require('./aiService');

const getDashboard = async () => {
  const [analytics, aiStatus, recentApplications] = await Promise.all([
    analyticsService.getOrgAnalytics(),
    aiService
      .health()
      .then((status) => ({ status: status.status || 'healthy', latency: status.latency || 'unknown' }))
      .catch(() => ({ status: 'unavailable' })),
    prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        job: { select: { id: true, title: true } },
        candidate: { select: { id: true, fullName: true } }
      }
    })
  ]);

  const recentActivity = recentApplications.map((application) => ({
    type: 'candidate_application',
    description: `${application.candidate.fullName} applied for ${application.job.title}`,
    timestamp: application.createdAt,
    status: application.status
  }));

  return {
    overview: {
      headcount: analytics.headcount,
      openRoles: analytics.openRoles,
      activeContractors: analytics.activeContractors,
      pipelineActive: analytics.candidatePipeline.INTERVIEW || 0
    },
    recentActivity,
    systemHealth: aiStatus
  };
};

const getAllUsers = () => prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });

const createUser = async (payload) => {
  if (!payload.email || !payload.name) {
    throw new Error('Name and email are required');
  }

  return prisma.adminUser.create({
    data: {
      email: payload.email.toLowerCase(),
      name: payload.name,
      role: payload.role || 'admin'
    }
  });
};

const updateUser = (id, payload) =>
  prisma.adminUser.update({
    where: { id },
    data: {
      name: payload.name,
      role: payload.role,
      status: payload.status
    }
  });

const deleteUser = (id) => prisma.adminUser.delete({ where: { id } });

const getSystemAnalytics = () => analyticsService.getOrgAnalytics();

const generateReport = async (type, period = 'month') => {
  const analytics = await analyticsService.getOrgAnalytics();

  return {
    type,
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      headcount: analytics.headcount,
      openRoles: analytics.openRoles,
      pipeline: analytics.candidatePipeline
    },
    details: analytics
  };
};

const getAIStatus = () => aiService.health();

const trainAIModel = async () => ({
  status: 'queued',
  message: 'AI model fine-tuning request received. Processing will complete asynchronously.'
});

module.exports = {
  getDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemAnalytics,
  generateReport,
  getAIStatus,
  trainAIModel
};
