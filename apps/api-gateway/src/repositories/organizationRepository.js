const prisma = require('../lib/prisma');

const DEFAULT_COMPANY_SLUG = process.env.DEFAULT_COMPANY_SLUG || 'nova-people';
const DEFAULT_COMPANY_NAME = process.env.DEFAULT_COMPANY_NAME || 'NovaPeople Technologies';

const ensureDefaultCompany = async () =>
  prisma.company.upsert({
    where: { slug: DEFAULT_COMPANY_SLUG },
    update: {},
    create: {
      slug: DEFAULT_COMPANY_SLUG,
      name: DEFAULT_COMPANY_NAME,
      industry: 'Technology',
      sizeBucket: 'GROWTH',
      description: 'AI-enabled human resource and recruitment organization.',
      website: 'https://example.com',
      linkedinUrl: 'https://www.linkedin.com/company/novapeople',
      foundedYear: 2018
    }
  });

const ensureDepartment = async (companyId, name) => {
  const departmentName = name?.trim() || 'Operations';

  return prisma.department.upsert({
    where: {
      companyId_name: {
        companyId,
        name: departmentName
      }
    },
    update: {},
    create: {
      companyId,
      name: departmentName
    }
  });
};

const ensureLocation = async ({ label, city, country }) => {
  if (!label) {
    return null;
  }

  return prisma.location.upsert({
    where: { label },
    update: {
      city: city || undefined,
      country: country || undefined
    },
    create: {
      label,
      city: city || label,
      country: country || 'Vietnam'
    }
  });
};

const ensureSalaryBand = async (companyId, code, payload = {}) => {
  const bandCode = code || 'G5';

  return prisma.salaryBand.upsert({
    where: {
      companyId_code: {
        companyId,
        code: bandCode
      }
    },
    update: {
      title: payload.title || 'Generalist',
      level: payload.level || 'MID',
      minComp: payload.minComp || 30000,
      maxComp: payload.maxComp || 90000,
      currency: payload.currency || 'USD'
    },
    create: {
      companyId,
      code: bandCode,
      title: payload.title || 'Generalist',
      level: payload.level || 'MID',
      minComp: payload.minComp || 30000,
      maxComp: payload.maxComp || 90000,
      currency: payload.currency || 'USD'
    }
  });
};

const ensureSkill = async (name, category = null) => {
  const skillName = name.trim();
  if (!skillName) {
    return null;
  }

  return prisma.skill.upsert({
    where: { name: skillName },
    update: {
      category: category || undefined
    },
    create: {
      name: skillName,
      category
    }
  });
};

module.exports = {
  ensureDefaultCompany,
  ensureDepartment,
  ensureLocation,
  ensureSalaryBand,
  ensureSkill
};
