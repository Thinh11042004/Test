const { z } = require('zod');
const prisma = require('../prisma');
const ApiError = require('../utils/apiError');
const { recordAudit } = require('../services/auditService');

const jobPayload = z.object({
  title: z.string().min(3),
  jdRaw: z.string().min(10),
  skills: z.array(z.string()).min(1),
  department: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable()
});

const listJobs = async (req, res) => {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: true,
      applications: true
    }
  });

  res.json(jobs.map((job) => ({
    id: job.id,
    title: job.title,
    department: job.department,
    level: job.level,
    location: job.location,
    type: job.type,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    createdBy: job.createdBy ? {
      id: job.createdBy.id,
      fullName: job.createdBy.fullName
    } : null,
    skills: job.skills,
    applicationsCount: job.applications.length
  })));
};

const getJob = async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: true,
      applications: {
        include: {
          candidate: {
            include: { user: true }
          },
          resume: true
        }
      }
    }
  });

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  res.json(job);
};

const createJob = async (req, res) => {
  const payload = jobPayload.parse(req.body);

  const job = await prisma.job.create({
    data: {
      ...payload,
      salaryMin: payload.salaryMin ?? null,
      salaryMax: payload.salaryMax ?? null,
      department: payload.department ?? null,
      level: payload.level ?? null,
      location: payload.location ?? null,
      type: payload.type ?? null,
      createdById: req.user.id
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'JOB_CREATED',
    entity: 'Job',
    entityId: job.id,
    metadata: payload
  });

  res.status(201).json(job);
};

const updateJob = async (req, res) => {
  const payload = jobPayload.partial().parse(req.body);

  const job = await prisma.job.update({
    where: { id: req.params.id },
    data: {
      ...payload,
      salaryMin: payload.salaryMin ?? undefined,
      salaryMax: payload.salaryMax ?? undefined,
      department: payload.department ?? undefined,
      level: payload.level ?? undefined,
      location: payload.location ?? undefined,
      type: payload.type ?? undefined
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'JOB_UPDATED',
    entity: 'Job',
    entityId: job.id,
    metadata: payload
  });

  res.json(job);
};

module.exports = {
  listJobs,
  getJob,
  createJob,
  updateJob
};