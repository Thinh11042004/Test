const prisma = require('../lib/prisma');

const EMPLOYEE_INCLUDE = {
  department: { select: { id: true, name: true } },
  location: { select: { id: true, label: true } },
  manager: { select: { id: true, fullName: true, jobTitle: true } },
  salaryBand: true,
  skills: {
    include: {
      skill: {
        select: {
          id: true,
          name: true,
          category: true
        }
      }
    }
  }
};

const findMany = async (where = {}, options = {}) =>
  prisma.employee.findMany({
    where,
    include: EMPLOYEE_INCLUDE,
    orderBy: options.orderBy ?? [
      { lastName: 'asc' },
      { firstName: 'asc' },
      { fullName: 'asc' }
    ],
    take: options.take,
    skip: options.skip
  });

const findById = (id) =>
  prisma.employee.findUnique({
    where: { id },
    include: {
      ...EMPLOYEE_INCLUDE,
      performanceReviews: {
        orderBy: { reviewDate: 'desc' }
      }
    }
  });

const findByCode = (employeeCode) =>
  prisma.employee.findUnique({
    where: { employeeCode },
    include: EMPLOYEE_INCLUDE
  });

const create = (data) =>
  prisma.employee.create({
    data,
    include: EMPLOYEE_INCLUDE
  });

const update = (id, data) =>
  prisma.employee.update({
    where: { id },
    data,
    include: EMPLOYEE_INCLUDE
  });

const remove = (id) =>
  prisma.employee.delete({ where: { id } });

const replaceSkills = async (employeeId, skills = []) => {
  await prisma.employeeSkill.deleteMany({ where: { employeeId } });

  if (!skills.length) {
    return [];
  }

  await prisma.employeeSkill.createMany({
    data: skills.map((skill, index) => ({
      employeeId,
      skillId: skill.skillId,
      proficiency: skill.proficiency,
      primary: index === 0 && skill.primary !== false,
      yearsExperience: skill.yearsExperience ?? null
    }))
  });

  return prisma.employee.findUnique({
    where: { id: employeeId },
    include: EMPLOYEE_INCLUDE
  });
};

const listPerformanceReviews = (employeeId) =>
  prisma.performanceReview.findMany({
    where: { employeeId },
    orderBy: { reviewDate: 'desc' }
  });

module.exports = {
  findMany,
  findById,
  findByCode,
  create,
  update,
  remove,
  replaceSkills,
  listPerformanceReviews,
  EMPLOYEE_INCLUDE
};