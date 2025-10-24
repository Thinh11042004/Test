const prisma = require('../lib/prisma');

const CANDIDATE_INCLUDE = {
  location: { select: { id: true, label: true } },
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
  },
  experiences: true,
  educations: true
};

const findMany = (where = {}, options = {}) =>
  prisma.candidate.findMany({
    where,
    include: CANDIDATE_INCLUDE,
    orderBy: options.orderBy ?? [{ fullName: 'asc' }],
    take: options.take,
    skip: options.skip
  });

const findById = (id) =>
  prisma.candidate.findUnique({
    where: { id },
    include: {
      ...CANDIDATE_INCLUDE,
      applications: {
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              department: { select: { id: true, name: true } }
            }
          }
        }
      }
    }
  });

const create = (data) =>
  prisma.candidate.create({
    data,
    include: CANDIDATE_INCLUDE
  });

const update = (id, data) =>
  prisma.candidate.update({
    where: { id },
    data,
    include: CANDIDATE_INCLUDE
  });

const remove = (id) =>
  prisma.candidate.delete({ where: { id } });

const replaceSkills = async (candidateId, skills = []) => {
  await prisma.candidateSkill.deleteMany({ where: { candidateId } });

  if (!skills.length) {
    return [];
  }

  await prisma.candidateSkill.createMany({
    data: skills.map((skill, index) => ({
      candidateId,
      skillId: skill.skillId,
      proficiency: skill.proficiency,
      primary: index === 0 && skill.primary !== false,
      yearsExperience: skill.yearsExperience ?? null
    }))
  });

  return prisma.candidate.findUnique({
    where: { id: candidateId },
    include: CANDIDATE_INCLUDE
  });
};

module.exports = {
  CANDIDATE_INCLUDE,
  findMany,
  findById,
  create,
  update,
  remove,
  replaceSkills
};