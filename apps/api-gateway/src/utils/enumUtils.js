const {
  EmploymentStatus,
  EmploymentType,
  WorkArrangement,
  SeniorityLevel,
  CandidateStatus,
  CandidateSource,
  JobStatus,
  ApplicationStatus,
  BenefitEnrollmentStatus
} = require('@prisma/client');

const sanitizeToken = (value) =>
  value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');

const mapEnum = (value, Enum, fallback, overrides = {}) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const token = sanitizeToken(value);
  if (overrides[token]) {
    return overrides[token];
  }

  if (Enum[token]) {
    return Enum[token];
  }

  return fallback;
};

const normalizeEmploymentType = (value) =>
  mapEnum(value, EmploymentType, EmploymentType.FULL_TIME, {
    CONTRACTOR: EmploymentType.CONTRACT,
    FREELANCE: EmploymentType.CONTRACT,
    CONSULTANT: EmploymentType.CONTRACT,
    TEMP: EmploymentType.TEMPORARY,
    TEMPORARY: EmploymentType.TEMPORARY,
    PARTTIME: EmploymentType.PART_TIME,
    PARTTIME_HOURS: EmploymentType.PART_TIME
  });

const normalizeWorkArrangement = (value) =>
  mapEnum(value, WorkArrangement, WorkArrangement.HYBRID, {
    FLEX: WorkArrangement.HYBRID,
    FLEXIBLE: WorkArrangement.HYBRID,
    WFH: WorkArrangement.REMOTE,
    REMOTE_FIRST: WorkArrangement.REMOTE
  });

const normalizeEmploymentStatus = (value) =>
  mapEnum(value, EmploymentStatus, EmploymentStatus.ACTIVE, {
    NEW_HIRE: EmploymentStatus.ONBOARDING,
    ONBOARDING: EmploymentStatus.ONBOARDING,
    PROBATION: EmploymentStatus.ONBOARDING,
    LEAVE_OF_ABSENCE: EmploymentStatus.LEAVE,
    SABBATICAL: EmploymentStatus.LEAVE,
    EXITED: EmploymentStatus.TERMINATED,
    OFFBOARDING: EmploymentStatus.TERMINATED
  });

const normalizeCandidateStatus = (value) =>
  mapEnum(value, CandidateStatus, CandidateStatus.NEW, {
    SOURCING: CandidateStatus.PROSPECT,
    SCREENING: CandidateStatus.SCREENING,
    INTERVIEWING: CandidateStatus.INTERVIEW
  });

const normalizeCandidateSource = (value) =>
  mapEnum(value, CandidateSource, CandidateSource.OTHER, {
    LINKEDIN: CandidateSource.SOCIAL,
    SOCIAL_MEDIA: CandidateSource.SOCIAL,
    REFERRAL_PROGRAM: CandidateSource.REFERRAL
  });

const normalizeJobStatus = (value) =>
  mapEnum(value, JobStatus, JobStatus.DRAFT, {
    OPENED: JobStatus.OPEN,
    ACTIVE: JobStatus.OPEN,
    ONHOLD: JobStatus.ON_HOLD,
    CLOSED_FILLED: JobStatus.FILLED
  });

const normalizeSeniority = (value) =>
  mapEnum(value, SeniorityLevel, SeniorityLevel.MID, {});

const normalizeApplicationStatus = (value) =>
  mapEnum(value, ApplicationStatus, ApplicationStatus.APPLIED, {
    SCREENING: ApplicationStatus.SCREEN,
    INTERVIEWING: ApplicationStatus.INTERVIEW,
    OFFERED: ApplicationStatus.OFFER,
    HIRED: ApplicationStatus.HIRED,
    REJECT: ApplicationStatus.REJECTED
  });

const normalizeBenefitEnrollmentStatus = (value) =>
  mapEnum(value, BenefitEnrollmentStatus, BenefitEnrollmentStatus.ACTIVE, {
    INACTIVE: BenefitEnrollmentStatus.CANCELLED
  });

const inferSeniorityFromTitle = (title = '') => {
  const normalized = title.toLowerCase();

  if (normalized.includes('intern') || normalized.includes('trainee')) {
    return SeniorityLevel.INTERN;
  }
  if (normalized.includes('junior') || normalized.includes('jr')) {
    return SeniorityLevel.JUNIOR;
  }
  if (normalized.includes('principal')) {
    return SeniorityLevel.PRINCIPAL;
  }
  if (normalized.includes('lead') || normalized.includes('staff')) {
    return SeniorityLevel.LEAD;
  }
  if (normalized.includes('director')) {
    return SeniorityLevel.DIRECTOR;
  }
  if (normalized.includes('vp') || normalized.includes('vice president')) {
    return SeniorityLevel.VICE_PRESIDENT;
  }
  if (normalized.includes('chief') || normalized.includes('cfo') || normalized.includes('ceo')) {
    return SeniorityLevel.EXECUTIVE;
  }
  if (normalized.includes('senior') || normalized.includes('sr')) {
    return SeniorityLevel.SENIOR;
  }

  return SeniorityLevel.MID;
};

module.exports = {
  normalizeEmploymentType,
  normalizeWorkArrangement,
  normalizeEmploymentStatus,
  normalizeCandidateStatus,
  normalizeCandidateSource,
  normalizeJobStatus,
  normalizeApplicationStatus,
  normalizeBenefitEnrollmentStatus,
  normalizeSeniority,
  inferSeniorityFromTitle
};