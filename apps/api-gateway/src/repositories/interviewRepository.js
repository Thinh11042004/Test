const prisma = require('../lib/prisma');

const INTERVIEW_INCLUDE = {
  application: {
    select: {
      id: true,
      status: true,
      job: {
        select: {
          id: true,
          title: true,
          department: { select: { id: true, name: true } }
        }
      },
      candidate: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  },
  feedback: true
};

const listUpcoming = (options = {}) =>
  prisma.interview.findMany({
    where: {
      scheduledAt: {
        gte: options.startDate ?? new Date(0)
      }
    },
    include: INTERVIEW_INCLUDE,
    orderBy: { scheduledAt: 'asc' },
    take: options.take
  });

const listByCandidate = (candidateId) =>
  prisma.interview.findMany({
    where: { application: { candidateId } },
    include: INTERVIEW_INCLUDE,
    orderBy: { scheduledAt: 'desc' }
  });

module.exports = {
  INTERVIEW_INCLUDE,
  listUpcoming,
  listByCandidate
};