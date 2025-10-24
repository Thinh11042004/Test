const { Decimal } = require('@prisma/client/runtime/library');
const { format } = require('date-fns');

const decimalToNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Decimal) {
    return Number(value.toString());
  }

  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }

  return Number(value);
};

const toISODate = (date) => {
  if (!date) {
    return null;
  }

  try {
    return new Date(date).toISOString();
  } catch (error) {
    return null;
  }
};

const toDisplayDate = (date) => {
  if (!date) {
    return null;
  }

  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    return null;
  }
};

const serializeSkillList = (skillAssignments = []) =>
  skillAssignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.skill?.name ?? assignment.name,
    category: assignment.skill?.category ?? null,
    proficiency: assignment.proficiency,
    primary: assignment.primary,
    yearsExperience: assignment.yearsExperience ?? null
  }));

const serializeEmployee = (employee) => {
  if (!employee) {
    return null;
  }

  const skills = serializeSkillList(employee.skills);

  return {
    id: employee.id,
    code: employee.employeeCode,
    name: employee.fullName,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    title: employee.jobTitle,
    department: employee.department?.name ?? null,
    departmentId: employee.departmentId,
    location: employee.location?.label ?? null,
    workArrangement: employee.workArrangement,
    employmentType: employee.employmentType,
    seniority: employee.seniority,
    status: employee.status,
    hireDate: toDisplayDate(employee.hireDate),
    hireDateISO: toISODate(employee.hireDate),
    manager: employee.manager
      ? {
          id: employee.manager.id,
          name: employee.manager.fullName,
          title: employee.manager.jobTitle
        }
      : null,
    salaryBand: employee.salaryBand
      ? {
          id: employee.salaryBand.id,
          code: employee.salaryBand.code,
          title: employee.salaryBand.title,
          minComp: decimalToNumber(employee.salaryBand.minComp),
          maxComp: decimalToNumber(employee.salaryBand.maxComp),
          currency: employee.salaryBand.currency
        }
      : null,
    salary: decimalToNumber(employee.annualSalary),
    currency: employee.currency,
    performanceSummary: employee.performanceSummary,
    skills: skills.map((skill) => skill.name).filter(Boolean),
    skillDetails: skills
  };
};

const serializeCandidate = (candidate) => {
  if (!candidate) {
    return null;
  }

  return {
    id: candidate.id,
    code: candidate.candidateCode,
    name: candidate.fullName,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    headline: candidate.headline,
    desiredRole: candidate.desiredRole,
    location: candidate.location?.label ?? null,
    status: candidate.status,
    source: candidate.source,
    experienceYears: candidate.totalExperienceYears
      ? Number(candidate.totalExperienceYears)
      : null,
    noticePeriodDays: candidate.noticePeriodDays,
    salaryExpectation: decimalToNumber(candidate.salaryExpectation),
    currency: candidate.currency,
    resumeUrl: candidate.resumeUrl,
    linkedinUrl: candidate.linkedinUrl,
    githubUrl: candidate.githubUrl,
    portfolioUrl: candidate.portfolioUrl,
    resumeHighlights: candidate.resumeHighlights ?? [],
    openToRemote: candidate.openToRemote,
    openToRelocation: candidate.openToRelocation,
    skills: (candidate.skills || []).map((item) => item.skill?.name ?? item.name).filter(Boolean),
    skillDetails: serializeSkillList(candidate.skills),
    experiences: (candidate.experiences || []).map((experience) => ({
      id: experience.id,
      companyName: experience.companyName,
      title: experience.title,
      startDate: toDisplayDate(experience.startDate),
      endDate: toDisplayDate(experience.endDate),
      responsibilities: experience.responsibilities ?? [],
      achievements: experience.achievements ?? [],
      technologies: experience.technologies ?? []
    })),
    educations: (candidate.educations || []).map((education) => ({
      id: education.id,
      institution: education.institution,
      fieldOfStudy: education.fieldOfStudy,
      level: education.level,
      startDate: toDisplayDate(education.startDate),
      endDate: toDisplayDate(education.endDate),
      description: education.description
    }))
  };
};

const serializeJob = (job) => {
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    code: job.jobCode,
    title: job.title,
    department: job.department?.name ?? null,
    departmentId: job.departmentId,
    company: job.company?.name ?? null,
    status: job.status,
    level: job.level,
    employmentType: job.employmentType,
    workArrangement: job.workArrangement,
    locations: job.locations ?? [],
    description: job.description,
    openings: job.openings,
    salaryRange: [decimalToNumber(job.salaryMin), decimalToNumber(job.salaryMax)],
    currency: job.currency,
    postedAt: toDisplayDate(job.publishedAt),
    closesAt: toDisplayDate(job.closesAt),
    requiredSkills: (job.requirements || [])
      .filter((requirement) => requirement.type === 'MUST_HAVE')
      .map((requirement) => requirement.skill?.name ?? requirement.description),
    niceToHaveSkills: (job.requirements || [])
      .filter((requirement) => requirement.type === 'NICE_TO_HAVE')
      .map((requirement) => requirement.skill?.name ?? requirement.description),
    responsibilities: (job.requirements || [])
      .filter((requirement) => requirement.type === 'RESPONSIBILITY')
      .map((requirement) => requirement.description),
    benefits: (job.benefits || []).map((item) => ({
      id: item.benefit.id,
      name: item.benefit.name,
      category: item.benefit.category,
      highlight: item.highlight
    }))
  };
};

const serializeApplication = (application) => {
  if (!application) {
    return null;
  }

  return {
    id: application.id,
    code: application.applicationCode,
    jobId: application.jobId,
    candidateId: application.candidateId,
    status: application.status,
    source: application.source,
    submittedAt: toDisplayDate(application.submittedAt),
    lastAdvancedAt: toDisplayDate(application.lastAdvancedAt),
    salaryExpectation: decimalToNumber(application.salaryExpectation),
    currency: application.currency,
    matchScore: application.matchScore,
    recruiter: application.recruiter
      ? {
          id: application.recruiter.id,
          name: application.recruiter.fullName
        }
      : null
  };
};

const serializeInterview = (interview) => {
  if (!interview) {
    return null;
  }

  return {
    id: interview.id,
    applicationId: interview.applicationId,
    stage: interview.stage,
    scheduledAt: toISODate(interview.scheduledAt),
    endAt: toISODate(interview.endAt),
    interviewers: interview.interviewers ?? [],
    status: interview.status,
    notes: interview.notes,
    feedback: (interview.feedback || []).map((entry) => ({
      id: entry.id,
      interviewerName: entry.interviewerName,
      rating: entry.rating,
      recommendation: entry.recommendation,
      strengths: entry.strengths ?? [],
      concerns: entry.concerns ?? [],
      summary: entry.summary,
      submittedAt: toISODate(entry.submittedAt)
    }))
  };
};

module.exports = {
  decimalToNumber,
  toISODate,
  toDisplayDate,
  serializeSkillList,
  serializeEmployee,
  serializeCandidate,
  serializeJob,
  serializeApplication,
  serializeInterview
};