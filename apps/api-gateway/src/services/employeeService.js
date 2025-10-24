const { ProficiencyLevel, WorkArrangement } = require('@prisma/client');
const employeeRepository = require('../repositories/employeeRepository');
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
  normalizeEmploymentStatus,
  normalizeSeniority,
  inferSeniorityFromTitle
} = require('../utils/enumUtils');
const { splitFullName, buildEmployeeCode, parseLocation } = require('../utils/stringUtils');
const { serializeEmployee, serializeSkillList } = require('../utils/serializers');

const uniqueValues = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : value))
        .filter((value) => value !== undefined && value !== null && value !== '')
    )
  );

const buildSkillAssignments = async (skills = []) => {
  const uniqueSkills = uniqueValues(skills);

  const assignments = [];
  for (const skillName of uniqueSkills) {
    const skill = await ensureSkill(skillName);
    if (skill) {
      assignments.push({
        skillId: skill.id,
        proficiency: ProficiencyLevel.ADVANCED,
        primary: assignments.length === 0,
        yearsExperience: null
      });
    }
  }

  return assignments;
};

const cleanObject = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null)
  );

const listEmployees = async ({ search, departmentId } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  const employees = await employeeRepository.findMany(where);
  return employees.map(serializeEmployee);
};

const getEmployeeById = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    return null;
  }

  return serializeEmployee(employee);
};

const createEmployee = async (payload) => {
  const company = await ensureDefaultCompany();
  const department = await ensureDepartment(company.id, payload.department);

  const locationInput = parseLocation(payload.location ?? 'Ho Chi Minh City, Vietnam');
  const location = await ensureLocation(locationInput);

  const salaryBand = await ensureSalaryBand(company.id, payload.salaryBandCode, {
    title: payload.salaryBandTitle,
    level: payload.seniority ? normalizeSeniority(payload.seniority) : inferSeniorityFromTitle(payload.title),
    minComp: payload.salaryRange?.[0] ?? 42000,
    maxComp: payload.salaryRange?.[1] ?? 96000,
    currency: payload.currency || 'USD'
  });

  const { firstName, lastName } = splitFullName(payload.name || payload.fullName || 'New Team Member');
  const employmentType = normalizeEmploymentType(payload.employmentType);
  const workArrangement = payload.workArrangement
    ? normalizeWorkArrangement(payload.workArrangement)
    : WorkArrangement.HYBRID;
  const seniority = payload.seniority
    ? normalizeSeniority(payload.seniority)
    : inferSeniorityFromTitle(payload.title || payload.jobTitle || 'Specialist');

  const skillAssignments = await buildSkillAssignments(payload.skills);

  const employee = await employeeRepository.create({
    employeeCode: buildEmployeeCode(),
    companyId: company.id,
    departmentId: department.id,
    fullName: payload.name || payload.fullName || `${firstName || 'Teammate'} ${lastName || ''}`.trim(),
    firstName,
    lastName,
    preferredName: payload.preferredName || firstName,
    email:
      payload.email?.toLowerCase() ||
      `${(firstName || 'member').toLowerCase()}.${Date.now()}@novapeople.ai`,
    phone: payload.phone || null,
    jobTitle: payload.title || payload.jobTitle || 'Specialist',
    seniority,
    employmentType,
    workArrangement,
    hireDate: payload.hireDate ? new Date(payload.hireDate) : new Date(),
    annualSalary: payload.salary !== undefined ? Number(payload.salary) : null,
    currency: payload.currency || 'USD',
    status: normalizeEmploymentStatus(payload.status),
    location: location ? { connect: { id: location.id } } : undefined,
    salaryBand: salaryBand ? { connect: { id: salaryBand.id } } : undefined,
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

  return serializeEmployee(employee);
};

const updateEmployee = async (id, payload) => {
  const current = await employeeRepository.findById(id);
  if (!current) {
    return null;
  }

  const updates = {};

  if (payload.department) {
    const company = await ensureDefaultCompany();
    const department = await ensureDepartment(company.id, payload.department);
    updates.department = { connect: { id: department.id } };
  }

  if (payload.location) {
    const locationInput = parseLocation(payload.location);
    const location = await ensureLocation(locationInput);
    if (location) {
      updates.location = { connect: { id: location.id } };
    }
  }

  if (payload.name || payload.fullName) {
    const { firstName, lastName } = splitFullName(payload.name || payload.fullName);
    updates.fullName = payload.name || payload.fullName;
    updates.firstName = firstName;
    updates.lastName = lastName;
  }

  if (payload.title || payload.jobTitle) {
    updates.jobTitle = payload.title || payload.jobTitle;
    const inferredSeniority = inferSeniorityFromTitle(payload.title || payload.jobTitle);
    updates.seniority = payload.seniority
      ? normalizeSeniority(payload.seniority)
      : inferredSeniority;
  }

  if (payload.employmentType) {
    updates.employmentType = normalizeEmploymentType(payload.employmentType);
  }

  if (payload.workArrangement) {
    updates.workArrangement = normalizeWorkArrangement(payload.workArrangement);
  }

  if (payload.status) {
    updates.status = normalizeEmploymentStatus(payload.status);
  }

  if (payload.salary !== undefined) {
    updates.annualSalary = Number(payload.salary);
  }

  if (payload.currency) {
    updates.currency = payload.currency;
  }

  if (payload.email) {
    updates.email = payload.email.toLowerCase();
  }

  if (payload.phone) {
    updates.phone = payload.phone;
  }

  if (payload.hireDate) {
    updates.hireDate = new Date(payload.hireDate);
  }

  const skillAssignments = Array.isArray(payload.skills)
    ? await buildSkillAssignments(payload.skills)
    : [];

  const employee = await employeeRepository.update(
    id,
    cleanObject({
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
    })
  );

  return serializeEmployee(employee);
};

const deleteEmployee = async (id) => {
  await employeeRepository.remove(id);
  return true;
};

const getEmployeePerformance = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    return null;
  }

  const reviews = employee.performanceReviews ?? [];
  const latestReview = reviews[0] || null;

  const averageScore = (key) => {
    if (!reviews.length) {
      return null;
    }
    const total = reviews.reduce((sum, review) => sum + (review[key] ?? 0), 0);
    return Math.round(total / reviews.length);
  };

  const velocity = latestReview
    ? Math.round(
        latestReview.performanceScore * 0.4 +
          latestReview.potentialScore * 0.35 +
          latestReview.engagementScore * 0.25
      )
    : null;

  const focusAreas = latestReview?.focusAreas || [];
  const achievements = latestReview?.achievements || [];

  const learningPaths = serializeSkillList(employee.skills).map((skill) => ({
    skill: skill.name,
    recommendation: `Thúc đẩy ${skill.name} thông qua mentorship nội bộ và dự án thực tế.`,
    focus: skill.primary ? 'primary' : 'supporting'
  }));

  return {
    employee: serializeEmployee(employee),
    latestReview: latestReview
      ? {
          id: latestReview.id,
          reviewPeriod: latestReview.reviewPeriod,
          reviewDate: latestReview.reviewDate,
          overallScore: latestReview.overallScore,
          performanceScore: latestReview.performanceScore,
          potentialScore: latestReview.potentialScore,
          engagementScore: latestReview.engagementScore,
          achievements,
          focusAreas,
          recommendations: latestReview.recommendations
        }
      : null,
    averages: {
      performance: averageScore('performanceScore'),
      potential: averageScore('potentialScore'),
      engagement: averageScore('engagementScore')
    },
    velocity,
    focusAreas,
    achievements,
    learningPaths
  };
};

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePerformance
};