const prisma = require('../prisma');

const recordAudit = async ({ actorId, action, entity, entityId, metadata }) => {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      metadata
    }
  });
};

module.exports = {
  recordAudit
};