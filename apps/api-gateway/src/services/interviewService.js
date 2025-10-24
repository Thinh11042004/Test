const {
  ApplicationStatus,
  CandidateSource,
  EmploymentType,
  WorkArrangement,
  SeniorityLevel
} = require('@prisma/client');
const jobRepository = require('../repositories/jobRepository');
const candidateRepository = require('../repositories/candidateRepository');
const {
  ensureDefaultCompany,
  ensureDepartment,
  ensureLocation,
  ensureSalaryBand,
  ensureSkill
} = require('../repositories/organizationRepository');
const {
  normalizeEmploymentType,
  normalizeWorkArrangement,
  normalizeJobStatus,
  normalizeCandidateSource,
  normalizeSeniority
} = require('../utils/enumUtils');
const { buildJobCode, parseLocation } = require('../utils/stringUtils');
const { serializeJob, serializeCandidate, serializeApplication } = require('../utils/serializers');
const aiService = require('./aiService');
const prisma = require('../lib/prisma');

const uniqueValues = (values = []) => Array.from(new Set(values.map((value) => value && value.toString().trim()).filter(Boolean)));

const buildRequirementCreates = async ({ requiredSkills = [], niceToHaveSkills = [], responsibilities = [] }) => {
  const entries = [];

  for (const skillName of uniqueValues(requiredSkills)) {
    const skill = await ensureSkill(skillName);
    entries.push({
      type: 'MUST_HAVE',
      priority: 'CORE',
      description: skillName,
      skillId: skill?.id || undefined
    });
  }

  for (const skillName of uniqueValues(niceToHaveSkills)) {
    const skill = await ensureSkill(skillName);
    entries.push({
      type: 'NICE_TO_HAVE',
      priority: 'IMPORTANT',
      description: skillName,
      skillId: skill?.id || undefined
    });
  }

  responsibilities.forEach((item) => {
    if (item) {
      entries.push({
        type: 'RESPONSIBILITY',
        priority: 'CORE',
        description: item
      });
    }
  });

  return entries;
};

const buildJobWhereClause = ({ status, department, level }) => {
  const where = {};

  if (status) {
    where.status = normalizeJobStatus(status);
  }

  if (department) {
    where.department = {
      name: { contains: department, mode: 'insensitive' }
    };
  }

  if (level) {
    where.level = normalizeSeniority(level);
  }

  return where;
};

const computeMatchScore = (job, candidate) => {
  const requiredSkills = (job.requirements || [])
    .filter((requirement) => requirement.type === 'MUST_HAVE')
    .map((requirement) => requirement.skill?.name || requirement.description);
  const niceSkills = (job.requirements || [])
    .filter((requirement) => requirement.type === 'NICE_TO_HAVE')
    .map((requirement) => requirement.skill?.name || requirement.description);

  const candidateSkills = new Set(
    (candidate.skills || []).map((skill) => skill.skill?.name || skill.name).filter(Boolean)
  );

  const matchedRequired = requiredSkills.filter((skill) => candidateSkills.has(skill));
  const matchedNice = niceSkills.filter((skill) => candidateSkills.has(skill));
  const missingRequired = requiredSkills.filter((skill) => !candidateSkills.has(skill));

  const baseScore = requiredSkills.length
    ? (matchedRequired.length / requiredSkills.length) * 70
    : 40;
  const niceScore = niceSkills.length ? (matchedNice.length / niceSkills.length) * 20 : 10;
  const experienceBoost = candidate.totalExperienceYears
    ? Math.min(Number(candidate.totalExperienceYears) * 2.5, 10)
    : 5;

  return {
    score: Math.round(Math.min(100, baseScore + niceScore + experienceBoost)),
    matchedRequired,
    matchedNice,
    missingRequired
  };
};

const getAllJobs = async ({ status, department, level, page = 1, limit = 10 } = {}) => {
  const where = buildJobWhereClause({ status, department, level });
  const take = Number(limit) || 10;
  const skip = (Number(page) - 1) * take;

  const jobs = await jobRepository.findMany(where, { take, skip });
  return jobs.map(serializeJob);
};

const getJobById = async (id) => {
  const job = await jobRepository.findById(id);
  if (!job) {
    return null;
  }

  const serialized = serializeJob(job);
  serialized.applications = job.applications.map((application) => ({
    ...serializeApplication(application),
    candidate: serializeCandidate(application.candidate)
  }));

  return serialized;
};

const createJob = async (payload) => {
  const company = await ensureDefaultCompany();
  const department = await ensureDepartment(company.id, payload.department);
  const location = payload.locations?.length
    ? await ensureLocation(parseLocation(payload.locations[0]))
    : payload.location
    ? await ensureLocation(parseLocation(payload.location))
    : null;

  const salaryBand = await ensureSalaryBand(company.id, payload.salaryBandCode, {
    title: payload.salaryBandTitle || `${payload.level || 'Mid'} Band`,
    level: payload.level ? normalizeSeniority(payload.level) : SeniorityLevel.MID,
    minComp: payload.salaryRange?.[0] ?? 50000,
    maxComp: payload.salaryRange?.[1] ?? 120000,
    currency: payload.currency || 'USD'
  });

  const requirements = await buildRequirementCreates({
    requiredSkills: payload.requiredSkills,
    niceToHaveSkills: payload.niceToHaveSkills,
    responsibilities: payload.responsibilities || []
  });

  const job = await jobRepository.create({
    jobCode: buildJobCode(payload.title || 'New Role'),
    companyId: company.id,
    departmentId: department.id,
    title: payload.title,
    description:
      payload.description ||
      'Đây là vị trí được tạo tự động từ bảng điều khiển NovaPeople để mở rộng đội ngũ.',
    status: normalizeJobStatus(payload.status || 'OPEN'),
    level: payload.level ? normalizeSeniority(payload.level) : SeniorityLevel.MID,
    employmentType: normalizeEmploymentType(payload.employmentType || EmploymentType.FULL_TIME),
    workArrangement: payload.workArrangement
      ? normalizeWorkArrangement(payload.workArrangement)
      : WorkArrangement.HYBRID,
    locations: payload.locations?.length ? payload.locations : payload.location ? [payload.location] : [],
    openings: payload.openings ?? 1,
    salaryMin: payload.salaryRange?.[0] !== undefined ? Number(payload.salaryRange[0]) : null,
    salaryMax: payload.salaryRange?.[1] !== undefined ? Number(payload.salaryRange[1]) : null,
    currency: payload.currency || 'USD',
    publishedAt: new Date(),
    location: location ? { connect: { id: location.id } } : undefined,
    salaryBand: salaryBand ? { connect: { id: salaryBand.id } } : undefined,
    requirements: requirements.length
      ? {
          create: requirements
        }
      : undefined
  });

  return serializeJob(job);
};

const updateJob = async (id, payload) => {
  const current = await jobRepository.findById(id);
  if (!current) {
    return null;
  }

  const updates = {};

  if (payload.department) {
    const company = await ensureDefaultCompany();
    const department = await ensureDepartment(company.id, payload.department);
    updates.department = { connect: { id: department.id } };
  }

  if (payload.locations?.length || payload.location) {
    updates.locations = payload.locations?.length ? payload.locations : [payload.location];
    const locationValue = payload.locations?.[0] || payload.location;
    if (locationValue) {
      const location = await ensureLocation(parseLocation(locationValue));
      if (location) {
        updates.location = { connect: { id: location.id } };
      }
    }
  }

  if (payload.status) {
    updates.status = normalizeJobStatus(payload.status);
  }

  if (payload.level) {
    updates.level = normalizeSeniority(payload.level);
  }

  if (payload.employmentType) {
    updates.employmentType = normalizeEmploymentType(payload.employmentType);
  }

  if (payload.workArrangement) {
    updates.workArrangement = normalizeWorkArrangement(payload.workArrangement);
  }

  if (payload.title) {
    updates.title = payload.title;
  }

  if (payload.description) {
    updates.description = payload.description;
  }

  if (payload.openings !== undefined) {
    updates.openings = payload.openings;
  }

  if (payload.salaryRange) {
    updates.salaryMin = payload.salaryRange[0] !== undefined ? Number(payload.salaryRange[0]) : null;
    updates.salaryMax = payload.salaryRange[1] !== undefined ? Number(payload.salaryRange[1]) : null;
  }

  const requirements = await buildRequirementCreates({
    requiredSkills: payload.requiredSkills,
    niceToHaveSkills: payload.niceToHaveSkills,
    responsibilities: payload.responsibilities || []
  });

  const job = await jobRepository.update(id, {
    ...updates,
    requirements: requirements.length
      ? {
          deleteMany: {},
          create: requirements
        }
      : undefined
  });

  return serializeJob(job);
};

const deleteJob = async (id) => {
  await jobRepository.remove(id);
  return true;
};

const getJobCandidates = async (jobId) => {
  const applications = await jobRepository.listApplications(jobId);
  return applications.map((application) => ({
    ...serializeApplication(application),
    candidate: serializeCandidate(application.candidate)
  }));
};

const applyToJob = async (jobId, applicationData) => {
  const job = await jobRepository.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  const candidate = await candidateRepository.findById(applicationData.candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const match = computeMatchScore(job, candidate);

  const application = await jobRepository.createApplication({
    applicationCode: `APP-${Date.now()}`,
    jobId,
    candidateId: candidate.id,
    status: ApplicationStatus.APPLIED,
    source: normalizeCandidateSource(applicationData.source || candidate.source || CandidateSource.OTHER),
    resumeUrl: applicationData.resumeUrl || candidate.resumeUrl,
    coverLetter: applicationData.coverLetter || null,
    salaryExpectation: applicationData.salaryExpectation !== undefined ? Number(applicationData.salaryExpectation) : (candidate.salaryExpectation ? Number(candidate.salaryExpectation) : null),
    currency: applicationData.currency || candidate.currency || 'USD',
    matchScore: match.score
  });

  await prisma.applicationStageHistory.create({
    data: {
      applicationId: application.id,
      status: ApplicationStatus.APPLIED,
      stage: 'INTRO',
      comment: 'Application created via API gateway.'
    }
  });

  const aiInsights = await aiService.evaluateMatch({
    job: serializeJob(job),
    candidate: serializeCandidate(candidate),
    matchedSkills: [...match.matchedRequired, ...match.matchedNice],
    missingSkills: match.missingRequired,
    matchScore: match.score
  });

  return {
    ...serializeApplication(application),
    candidate: serializeCandidate(candidate),
    insights: aiInsights
  };
};

const getJobMatches = async (jobId, limit = 5) => {
  const job = await jobRepository.findById(jobId);
  if (!job) {
    return [];
  }

  const candidates = await candidateRepository.findMany({}, { take: 20 });
  const jobDto = serializeJob(job);

  const scored = candidates.map((candidate) => {
    const match = computeMatchScore(job, candidate);
    return {
      candidate: serializeCandidate(candidate),
      match
    };
  });

  const topMatches = scored
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);

  const enriched = [];
  for (const entry of topMatches) {
    const aiDetails = await aiService.evaluateMatch({
      job: jobDto,
      candidate: entry.candidate,
      matchedSkills: [...entry.match.matchedRequired, ...entry.match.matchedNice],
      missingSkills: entry.match.missingRequired,
      matchScore: entry.match.score
    });

    enriched.push({
      candidate: entry.candidate,
      matchScore: entry.match.score,
      matchedSkills: [...entry.match.matchedRequired, ...entry.match.matchedNice],
      missingSkills: entry.match.missingRequired,
      insights: aiDetails
    });
  }

  return enriched;
};

const matchCandidateToJob = async ({ jobId, candidateId }) => {
  const job = await jobRepository.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  const candidate = await candidateRepository.findById(candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const jobDto = serializeJob(job);
  const candidateDto = serializeCandidate(candidate);
  const match = computeMatchScore(job, candidate);

  const aiDetails = await aiService.evaluateMatch({
    job: jobDto,
    candidate: candidateDto,
    matchedSkills: [...match.matchedRequired, ...match.matchedNice],
    missingSkills: match.missingRequired,
    matchScore: match.score
  });

  return {
    job: jobDto,
    candidate: candidateDto,
    matchScore: match.score,
    matchedSkills: [...match.matchedRequired, ...match.matchedNice],
    missingSkills: match.missingRequired,
    insights: aiDetails
  };
};

const getJobAnalytics = async (jobId) => {
  const job = await jobRepository.findById(jobId);
  if (!job) {
    return null;
  }

  const applications = await jobRepository.listApplications(jobId);
  const totalApplications = applications.length;
  const statusBreakdown = applications.reduce((acc, application) => {
    acc[application.status] = (acc[application.status] || 0) + 1;
    return acc;
  }, {});
  const averageMatchScore = totalApplications
    ? Math.round(
        applications.reduce((sum, application) => sum + (application.matchScore || 0), 0) /
          totalApplications
      )
    : null;

  const timeToFill = job.publishedAt
    ? Math.round((Date.now() - new Date(job.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    job: serializeJob(job),
    totalApplications,
    averageMatchScore,
    statusBreakdown,
    timeToFill,
    topCandidates: applications
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 3)
      .map((application) => ({
        candidate: serializeCandidate(application.candidate),
        matchScore: application.matchScore
      }))
  };
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobCandidates,
  applyToJob,
  getJobMatches,
  matchCandidateToJob,
  getJobAnalytics
};