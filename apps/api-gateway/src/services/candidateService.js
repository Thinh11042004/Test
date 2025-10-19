const { ProficiencyLevel } = require('@prisma/client');
const candidateRepository = require('../repositories/candidateRepository');
const { ensureLocation, ensureSkill } = require('../repositories/organizationRepository');
const {
  normalizeCandidateStatus,
  normalizeCandidateSource
} = require('../utils/enumUtils');
const { splitFullName, buildCandidateCode, parseLocation } = require('../utils/stringUtils');
const { serializeCandidate } = require('../utils/serializers');
const aiService = require('./aiService');
const prisma = require('../lib/prisma');

const uniqueValues = (values = []) => Array.from(new Set(values.map((value) => value && value.toString().trim()).filter(Boolean)));

const buildSkillAssignments = async (skills = []) => {
  const assignments = [];
  for (const skillName of uniqueValues(skills)) {
    const skill = await ensureSkill(skillName);
    if (skill) {
      assignments.push({
        skillId: skill.id,
        proficiency: ProficiencyLevel.WORKING,
        primary: assignments.length === 0,
        yearsExperience: null
      });
    }
  }
  return assignments;
};

const listCandidates = async ({ search, status, skills } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (status) {
    where.status = normalizeCandidateStatus(status);
  }

  if (skills && skills.length) {
    const skillList = Array.isArray(skills) ? skills : skills.split(',');
    where.skills = {
      some: {
        skill: {
          name: { in: skillList.map((name) => name.trim()), mode: 'insensitive' }
        }
      }
    };
  }

  const candidates = await candidateRepository.findMany(where);
  return candidates.map(serializeCandidate);
};

const getCandidateById = async (id) => {
  const candidate = await candidateRepository.findById(id);
  if (!candidate) {
    return null;
  }

  return serializeCandidate(candidate);
};

const createCandidate = async (payload) => {
  const { firstName, lastName } = splitFullName(payload.name || payload.fullName || 'New Candidate');
  const status = normalizeCandidateStatus(payload.status);
  const source = normalizeCandidateSource(payload.source);

  const location = payload.location
    ? await ensureLocation(parseLocation(payload.location))
    : null;

  const skillAssignments = await buildSkillAssignments(payload.skills);

  const candidate = await candidateRepository.create({
    candidateCode: buildCandidateCode(),
    fullName: payload.name || payload.fullName || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email: payload.email?.toLowerCase() || null,
    phone: payload.phone || null,
    headline: payload.headline || null,
    desiredRole: payload.desiredRole || null,
    status,
    source,
    totalExperienceYears: payload.experienceYears !== undefined ? Number(payload.experienceYears) : null,
    noticePeriodDays: payload.noticePeriodDays ?? null,
    salaryExpectation: payload.salaryExpectation !== undefined ? Number(payload.salaryExpectation) : null,
    currency: payload.currency || 'USD',
    resumeUrl: payload.resumeUrl || null,
    linkedinUrl: payload.linkedinUrl || null,
    githubUrl: payload.githubUrl || null,
    portfolioUrl: payload.portfolioUrl || null,
    openToRemote: payload.openToRemote ?? true,
    openToRelocation: payload.openToRelocation ?? false,
    location: location ? { connect: { id: location.id } } : undefined,
    skills: skillAssignments.length
      ? {
          create: skillAssignments.map((assignment, index) => ({
            skill: { connect: { id: assignment.skillId } },
            proficiency: assignment.proficiency,
            primary: index === 0 ? true : assignment.primary,
            yearsExperience: assignment.yearsExperience
          }))
        }
      : undefined
  });

  return serializeCandidate(candidate);
};

const updateCandidate = async (id, payload) => {
  const current = await candidateRepository.findById(id);
  if (!current) {
    return null;
  }

  const updates = {};

  if (payload.name || payload.fullName) {
    const { firstName, lastName } = splitFullName(payload.name || payload.fullName);
    updates.fullName = payload.name || payload.fullName;
    updates.firstName = firstName;
    updates.lastName = lastName;
  }

  if (payload.status) {
    updates.status = normalizeCandidateStatus(payload.status);
  }

  if (payload.source) {
    updates.source = normalizeCandidateSource(payload.source);
  }

  if (payload.location) {
    const location = await ensureLocation(parseLocation(payload.location));
    if (location) {
      updates.location = { connect: { id: location.id } };
    }
  }

  ['email', 'phone', 'headline', 'desiredRole', 'resumeUrl', 'linkedinUrl', 'githubUrl', 'portfolioUrl'].forEach(
    (field) => {
      if (payload[field] !== undefined) {
        updates[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
      }
    }
  );

  if (payload.experienceYears !== undefined) {
    updates.totalExperienceYears = Number(payload.experienceYears);
  }

  if (payload.noticePeriodDays !== undefined) {
    updates.noticePeriodDays = payload.noticePeriodDays;
  }

  if (payload.salaryExpectation !== undefined) {
    updates.salaryExpectation = Number(payload.salaryExpectation);
  }

  if (payload.currency) {
    updates.currency = payload.currency;
  }

  if (payload.openToRemote !== undefined) {
    updates.openToRemote = payload.openToRemote;
  }

  if (payload.openToRelocation !== undefined) {
    updates.openToRelocation = payload.openToRelocation;
  }

  const skillAssignments = Array.isArray(payload.skills)
    ? await buildSkillAssignments(payload.skills)
    : [];

  const candidate = await candidateRepository.update(id, {
    ...updates,
    skills: skillAssignments.length
      ? {
          deleteMany: {},
          create: skillAssignments.map((assignment, index) => ({
            skill: { connect: { id: assignment.skillId } },
            proficiency: assignment.proficiency,
            primary: index === 0 ? true : assignment.primary,
            yearsExperience: assignment.yearsExperience
          }))
        }
      : undefined
  });

  return serializeCandidate(candidate);
};

const deleteCandidate = async (id) => {
  await candidateRepository.remove(id);
  return true;
};

const uploadResume = async (candidateId, data) => {
  const candidate = await candidateRepository.update(candidateId, {
    resumeUrl: data.fileUrl || data.resumeUrl,
    resumeHighlights: data.highlights || []
  });

  return serializeCandidate(candidate);
};

const getCandidateJobs = async (candidateId) => {
  const applications = await prisma.jobApplication.findMany({
    where: { candidateId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          department: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  return applications.map((application) => ({
    jobId: application.job.id,
    jobTitle: application.job.title,
    status: application.status,
    matchScore: application.matchScore ?? null,
    department: application.job.department?.name ?? null,
    submittedAt: application.submittedAt
  }));
};

const parseCV = async (candidateId, cvText) => {
  const candidate = await candidateRepository.findById(candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const parsed = await aiService.parseResume({
    candidate: serializeCandidate(candidate),
    resumeText: cvText
  });

  await candidateRepository.update(candidateId, {
    resumeHighlights: parsed.highlights || [],
    summary: parsed.summary || candidate.summary || null,
    skills: parsed.skills?.length
      ? {
          deleteMany: {},
          create: await Promise.all(
            uniqueValues(parsed.skills).map(async (skillName, index) => {
              const skill = await ensureSkill(skillName);
              if (!skill) return null;
              return {
                skill: { connect: { id: skill.id } },
                proficiency: ProficiencyLevel.WORKING,
                primary: index === 0,
                yearsExperience: null
              };
            })
          ).then((items) => items.filter(Boolean))
        }
      : undefined
  });

  return parsed;
};

const getCandidateAnalytics = async (candidateId) => {
  const applications = await prisma.jobApplication.findMany({
    where: { candidateId },
    include: {
      job: {
        select: { id: true, title: true, status: true }
      }
    }
  });

  const totalApplications = applications.length;
  const byStatus = applications.reduce((acc, application) => {
    acc[application.status] = (acc[application.status] || 0) + 1;
    return acc;
  }, {});

  const avgMatchScore = applications.reduce((sum, application) => sum + (application.matchScore || 0), 0);

  const pipeline = Object.entries(byStatus).map(([stage, count]) => ({ stage, count }));

  return {
    totalApplications,
    pipeline,
    averageMatchScore: totalApplications ? Math.round(avgMatchScore / totalApplications) : null,
    lastApplication: applications
      .map((application) => application.submittedAt)
      .sort()
      .pop()
  };
};

module.exports = {
  listCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  getCandidateJobs,
  parseCV,
  getCandidateAnalytics
};
