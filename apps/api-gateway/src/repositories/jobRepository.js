<<<<<<< ours
const prisma = require('../lib/prisma');

const JOB_INCLUDE = {
  company: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  salaryBand: true,
  requirements: {
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
  benefits: {
    include: {
      benefit: true
    }
  }
};

const APPLICATION_INCLUDE = {
  candidate: {
    include: {
      skills: {
        include: {
          skill: { select: { id: true, name: true, category: true } }
        }
      }
    }
  },
  recruiter: { select: { id: true, fullName: true } }
};

const findMany = (where = {}, options = {}) =>
  prisma.jobPosting.findMany({
    where,
    include: JOB_INCLUDE,
    orderBy: options.orderBy ?? [{ createdAt: 'desc' }],
    take: options.take,
    skip: options.skip
  });

const findById = (id) =>
  prisma.jobPosting.findUnique({
    where: { id },
    include: {
      ...JOB_INCLUDE,
      applications: {
        include: APPLICATION_INCLUDE,
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

const create = (data) =>
  prisma.jobPosting.create({
    data,
    include: JOB_INCLUDE
  });

const update = (id, data) =>
  prisma.jobPosting.update({
    where: { id },
    data,
    include: JOB_INCLUDE
  });

const remove = (id) => prisma.jobPosting.delete({ where: { id } });

const createApplication = (data) =>
  prisma.jobApplication.create({
    data,
    include: APPLICATION_INCLUDE
  });

const listApplications = (jobId) =>
  prisma.jobApplication.findMany({
    where: { jobId },
    include: APPLICATION_INCLUDE,
    orderBy: { submittedAt: 'desc' }
  });

const listRequirements = (jobId) =>
  prisma.jobRequirement.findMany({
    where: { jobId },
    include: { skill: true }
  });

module.exports = {
  JOB_INCLUDE,
  APPLICATION_INCLUDE,
  findMany,
  findById,
  create,
  update,
  remove,
  createApplication,
  listApplications,
  listRequirements
};
=======
const prisma = require('../lib/prisma');

const JOB_INCLUDE = {
  company: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  salaryBand: true,
  requirements: {
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
  benefits: {
    include: {
      benefit: true
    }
  }
};

const APPLICATION_INCLUDE = {
  candidate: {
    include: {
      skills: {
        include: {
          skill: { select: { id: true, name: true, category: true } }
        }
      }
    }
  },
  recruiter: { select: { id: true, fullName: true } }
};

const findMany = (where = {}, options = {}) =>
  prisma.jobPosting.findMany({
    where,
    include: JOB_INCLUDE,
    orderBy: options.orderBy ?? [{ createdAt: 'desc' }],
    take: options.take,
    skip: options.skip
  });

const findById = (id) =>
  prisma.jobPosting.findUnique({
    where: { id },
    include: {
      ...JOB_INCLUDE,
      applications: {
        include: APPLICATION_INCLUDE,
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

const create = (data) =>
  prisma.jobPosting.create({
    data,
    include: JOB_INCLUDE
  });

const update = (id, data) =>
  prisma.jobPosting.update({
    where: { id },
    data,
    include: JOB_INCLUDE
  });

const remove = (id) => prisma.jobPosting.delete({ where: { id } });

const createApplication = (data) =>
  prisma.jobApplication.create({
    data,
    include: APPLICATION_INCLUDE
  });

const listApplications = (jobId) =>
  prisma.jobApplication.findMany({
    where: { jobId },
    include: APPLICATION_INCLUDE,
    orderBy: { submittedAt: 'desc' }
  });

const listRequirements = (jobId) =>
  prisma.jobRequirement.findMany({
    where: { jobId },
    include: { skill: true }
  });

module.exports = {
  JOB_INCLUDE,
  APPLICATION_INCLUDE,
  findMany,
  findById,
  create,
  update,
  remove,
  createApplication,
  listApplications,
  listRequirements
};
>>>>>>> theirs
