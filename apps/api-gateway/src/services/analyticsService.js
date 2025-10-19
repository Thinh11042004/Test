<<<<<<< ours
const { EmploymentType, EmploymentStatus } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { serializeEmployee } = require('../utils/serializers');

const aggregateByPeriod = (reviews) => {
  const bucket = new Map();

  reviews.forEach((review) => {
    const period = review.reviewPeriod;
    if (!bucket.has(period)) {
      bucket.set(period, {
        period,
        count: 0,
        performance: 0,
        engagement: 0,
        overall: 0
      });
    }

    const entry = bucket.get(period);
    entry.count += 1;
    entry.performance += review.performanceScore || 0;
    entry.engagement += review.engagementScore || 0;
    entry.overall += review.overallScore || 0;
  });

  return Array.from(bucket.values())
    .map((entry) => ({
      period: entry.period,
      avgPerformance: entry.count ? entry.performance / entry.count : 0,
      avgEngagement: entry.count ? entry.engagement / entry.count : 0,
      avgOverall: entry.count ? entry.overall / entry.count : 0
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

const getOrgAnalytics = async () => {
  const [headcount, contractors, openRoles, applicationsByStatus, jobRequirements, recentReviews] = await Promise.all([
    prisma.employee.count({ where: { status: EmploymentStatus.ACTIVE } }),
    prisma.employee.count({
      where: {
        status: EmploymentStatus.ACTIVE,
        employmentType: { not: EmploymentType.FULL_TIME }
      }
    }),
    prisma.jobPosting.count({ where: { status: 'OPEN' } }),
    prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { _all: true }
    }),
    prisma.jobRequirement.groupBy({
      by: ['description'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10
    }),
    prisma.performanceReview.findMany({
      orderBy: { reviewDate: 'desc' },
      take: 60
    })
  ]);

  const candidatePipeline = applicationsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count._all;
    return acc;
  }, {});

  const topSkillsInDemand = jobRequirements.map((entry) => ({
    skill: entry.description,
    count: entry._count._all
  }));

  const periodAverages = aggregateByPeriod(recentReviews);

  const learningEngagement = periodAverages.slice(0, 3).map((item) => ({
    program: item.period,
    completionRate: Math.min(1, item.avgEngagement / 100),
    uplift: Math.min(1, item.avgPerformance / 100)
  }));

  const productivityTrend = periodAverages.slice(-6).map((item) => ({
    period: item.period,
    score: Math.round(item.avgOverall)
  }));

  return {
    headcount,
    activeContractors: contractors,
    openRoles,
    candidatePipeline,
    learningEngagement,
    topSkillsInDemand,
    productivityTrend
  };
};

const getWorkforceInsight = async () => {
  const employees = await prisma.employee.findMany({
    where: { status: EmploymentStatus.ACTIVE },
    include: {
      department: true,
      skills: {
        include: { skill: true }
      },
      performanceReviews: {
        orderBy: { reviewDate: 'desc' },
        take: 1
      }
    }
  });

  const serializedEmployees = employees.map(serializeEmployee);

  const highPotentialEmployees = employees
    .filter((employee) => {
      const review = employee.performanceReviews[0];
      return review && review.potentialScore >= 80 && review.engagementScore >= 75;
    })
    .map((employee) => ({
      id: employee.id,
      name: employee.fullName,
      department: employee.department?.name,
      readinessWindow: employee.performanceReviews[0].potentialScore >= 90 ? '6 months' : '12 months'
    }));

  const teamsAtRisk = employees
    .filter((employee) => {
      const review = employee.performanceReviews[0];
      return review && review.engagementScore < 70;
    })
    .map((employee) => ({
      department: employee.department?.name,
      reason: 'Engagement score dưới 70 điểm. Khuyến nghị thiết lập chương trình coaching cá nhân hóa.'
    }));

  const automationOpportunities = serializedEmployees
    .filter((employee) => employee.skills.includes('Python') || employee.skills.includes('SQL'))
    .slice(0, 3)
    .map((employee) => ({
      process: 'Talent analytics automation',
      impact: 'Giảm 30% thời gian tổng hợp báo cáo nhân sự.',
      aiAssist: `Phân tích dữ liệu tuyển dụng nâng cao cùng ${employee.name}.`
    }));

  return {
    workforceStabilityIndex: Number(
      (highPotentialEmployees.length / Math.max(serializedEmployees.length, 1)).toFixed(2)
    ),
    highPotentialEmployees,
    teamsAtRisk,
    automationOpportunities,
    learningSuggestions: serializedEmployees.slice(0, 3).map((employee) => ({
      employeeId: employee.id,
      name: employee.name,
      suggestion: 'Đề xuất tham gia chương trình lãnh đạo số và mentoring chéo phòng ban.'
    }))
  };
};

module.exports = {
  getOrgAnalytics,
  getWorkforceInsight
};
=======
const { EmploymentType, EmploymentStatus } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { serializeEmployee } = require('../utils/serializers');

const aggregateByPeriod = (reviews) => {
  const bucket = new Map();

  reviews.forEach((review) => {
    const period = review.reviewPeriod;
    if (!bucket.has(period)) {
      bucket.set(period, {
        period,
        count: 0,
        performance: 0,
        engagement: 0,
        overall: 0
      });
    }

    const entry = bucket.get(period);
    entry.count += 1;
    entry.performance += review.performanceScore || 0;
    entry.engagement += review.engagementScore || 0;
    entry.overall += review.overallScore || 0;
  });

  return Array.from(bucket.values())
    .map((entry) => ({
      period: entry.period,
      avgPerformance: entry.count ? entry.performance / entry.count : 0,
      avgEngagement: entry.count ? entry.engagement / entry.count : 0,
      avgOverall: entry.count ? entry.overall / entry.count : 0
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

const getOrgAnalytics = async () => {
  const [headcount, contractors, openRoles, applicationsByStatus, jobRequirements, recentReviews] = await Promise.all([
    prisma.employee.count({ where: { status: EmploymentStatus.ACTIVE } }),
    prisma.employee.count({
      where: {
        status: EmploymentStatus.ACTIVE,
        employmentType: { not: EmploymentType.FULL_TIME }
      }
    }),
    prisma.jobPosting.count({ where: { status: 'OPEN' } }),
    prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { _all: true }
    }),
    prisma.jobRequirement.groupBy({
      by: ['description'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10
    }),
    prisma.performanceReview.findMany({
      orderBy: { reviewDate: 'desc' },
      take: 60
    })
  ]);

  const candidatePipeline = applicationsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count._all;
    return acc;
  }, {});

  const topSkillsInDemand = jobRequirements.map((entry) => ({
    skill: entry.description,
    count: entry._count._all
  }));

  const periodAverages = aggregateByPeriod(recentReviews);

  const learningEngagement = periodAverages.slice(0, 3).map((item) => ({
    program: item.period,
    completionRate: Math.min(1, item.avgEngagement / 100),
    uplift: Math.min(1, item.avgPerformance / 100)
  }));

  const productivityTrend = periodAverages.slice(-6).map((item) => ({
    period: item.period,
    score: Math.round(item.avgOverall)
  }));

  return {
    headcount,
    activeContractors: contractors,
    openRoles,
    candidatePipeline,
    learningEngagement,
    topSkillsInDemand,
    productivityTrend
  };
};

const getWorkforceInsight = async () => {
  const employees = await prisma.employee.findMany({
    where: { status: EmploymentStatus.ACTIVE },
    include: {
      department: true,
      skills: {
        include: { skill: true }
      },
      performanceReviews: {
        orderBy: { reviewDate: 'desc' },
        take: 1
      }
    }
  });

  const serializedEmployees = employees.map(serializeEmployee);

  const highPotentialEmployees = employees
    .filter((employee) => {
      const review = employee.performanceReviews[0];
      return review && review.potentialScore >= 80 && review.engagementScore >= 75;
    })
    .map((employee) => ({
      id: employee.id,
      name: employee.fullName,
      department: employee.department?.name,
      readinessWindow: employee.performanceReviews[0].potentialScore >= 90 ? '6 months' : '12 months'
    }));

  const teamsAtRisk = employees
    .filter((employee) => {
      const review = employee.performanceReviews[0];
      return review && review.engagementScore < 70;
    })
    .map((employee) => ({
      department: employee.department?.name,
      reason: 'Engagement score dưới 70 điểm. Khuyến nghị thiết lập chương trình coaching cá nhân hóa.'
    }));

  const automationOpportunities = serializedEmployees
    .filter((employee) => employee.skills.includes('Python') || employee.skills.includes('SQL'))
    .slice(0, 3)
    .map((employee) => ({
      process: 'Talent analytics automation',
      impact: 'Giảm 30% thời gian tổng hợp báo cáo nhân sự.',
      aiAssist: `Phân tích dữ liệu tuyển dụng nâng cao cùng ${employee.name}.`
    }));

  return {
    workforceStabilityIndex: Number(
      (highPotentialEmployees.length / Math.max(serializedEmployees.length, 1)).toFixed(2)
    ),
    highPotentialEmployees,
    teamsAtRisk,
    automationOpportunities,
    learningSuggestions: serializedEmployees.slice(0, 3).map((employee) => ({
      employeeId: employee.id,
      name: employee.name,
      suggestion: 'Đề xuất tham gia chương trình lãnh đạo số và mentoring chéo phòng ban.'
    }))
  };
};

module.exports = {
  getOrgAnalytics,
  getWorkforceInsight
};
>>>>>>> theirs
