const { z } = require('zod');
const prisma = require('../prisma');
const ApiError = require('../utils/apiError');
const { recordAudit } = require('../services/auditService');
const { getRankingForJob } = require('../services/rankingService');

const createSchema = z.object({
  jobId: z.string(),
  candidateId: z.string(),
  resumeId: z.string().optional().nullable()
});

const updateSchema = z.object({
  status: z.enum(['SUBMITTED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']).optional(),
  stage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable()
});

const createApplication = async (req, res) => {
  const payload = createSchema.parse(req.body);

  if (req.user.role === 'CANDIDATE') {
    const candidate = await prisma.candidate.findFirst({ where: { userId: req.user.id } });
    if (!candidate || candidate.id !== payload.candidateId) {
      throw new ApiError(403, 'You can only apply on behalf of yourself');
    }
  }

  const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (payload.resumeId) {
    const resume = await prisma.resume.findUnique({ where: { id: payload.resumeId } });
    if (!resume) {
      throw new ApiError(404, 'Resume not found');
    }
    if (resume.candidateId !== payload.candidateId) {
      throw new ApiError(400, 'Resume must belong to the candidate');
    }
  }

  const application = await prisma.application.create({
    data: {
      jobId: payload.jobId,
      candidateId: payload.candidateId,
      resumeId: payload.resumeId ?? null
    },
    include: {
      job: true,
      candidate: true,
      resume: true
    }
  });

  await recordAudit({
    actorId: req.user?.id,
    action: 'APPLICATION_CREATED',
    entity: 'Application',
    entityId: application.id,
    metadata: payload
  });

  res.status(201).json(application);
};

const updateApplication = async (req, res) => {
  const payload = updateSchema.parse(req.body);

  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status: payload.status ?? undefined,
      stage: payload.stage ?? undefined,
      notes: payload.notes ?? undefined,
      score: payload.score ?? undefined
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'APPLICATION_UPDATED',
    entity: 'Application',
    entityId: application.id,
    metadata: payload
  });

  res.json(application);
};

const listByJob = async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { jobId: req.params.jobId },
    orderBy: { createdAt: 'desc' },
    include: {
      candidate: {
        include: { user: true }
      },
      resume: true
    }
  });

  res.json(applications);
};

const rankingForJob = async (req, res) => {
  const ranking = await getRankingForJob(req.params.jobId);
  res.json(ranking);
};

const listMine = async (req, res) => {
  if (req.user.role !== 'CANDIDATE') {
    throw new ApiError(403, 'Candidate role required');
  }

  const candidate = await prisma.candidate.findFirst({ where: { userId: req.user.id } });
  if (!candidate) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: candidate.id },
    include: {
      job: true,
      resume: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(applications);
};

module.exports = {
  createApplication,
  updateApplication,
  listByJob,
  rankingForJob,
  listMine
};