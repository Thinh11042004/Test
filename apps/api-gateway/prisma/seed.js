const {
  PrismaClient,
  EmploymentType,
  WorkArrangement,
  SeniorityLevel,
  CandidateStatus,
  CandidateSource,
  ApplicationStatus,
  InterviewStage,
  InterviewStatus,
  HiringRecommendation
} = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: 'nova-people' },
    update: {},
    create: {
      slug: 'nova-people',
      name: 'NovaPeople Technologies',
      industry: 'Technology',
      sizeBucket: 'GROWTH',
      description: 'AI-powered workforce and recruitment operations partner.',
      website: 'https://novapeople.example',
      linkedinUrl: 'https://linkedin.com/company/novapeople',
      foundedYear: 2018
    }
  });

  const locations = await Promise.all([
    prisma.location.upsert({
      where: { label: 'Ho Chi Minh City, Vietnam' },
      update: {},
      create: {
        label: 'Ho Chi Minh City, Vietnam',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh'
      }
    }),
    prisma.location.upsert({
      where: { label: 'Hanoi, Vietnam' },
      update: {},
      create: {
        label: 'Hanoi, Vietnam',
        city: 'Hanoi',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh'
      }
    }),
    prisma.location.upsert({
      where: { label: 'Singapore' },
      update: {},
      create: {
        label: 'Singapore',
        city: 'Singapore',
        country: 'Singapore',
        timezone: 'Asia/Singapore'
      }
    })
  ]);

  const [hcmLocation, hanoiLocation, singaporeLocation] = locations;

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Product Engineering' } },
      update: {},
      create: { companyId: company.id, name: 'Product Engineering' }
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Talent Acquisition' } },
      update: {},
      create: { companyId: company.id, name: 'Talent Acquisition' }
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: 'People Operations' } },
      update: {},
      create: { companyId: company.id, name: 'People Operations' }
    })
  ]);

  const [engineeringDept, talentDept, peopleDept] = departments;

  const salaryBands = await Promise.all([
    prisma.salaryBand.upsert({
      where: { companyId_code: { companyId: company.id, code: 'ENG-SR' } },
      update: {},
      create: {
        companyId: company.id,
        code: 'ENG-SR',
        title: 'Senior Engineer',
        level: SeniorityLevel.SENIOR,
        minComp: 60000,
        maxComp: 110000,
        currency: 'USD'
      }
    }),
    prisma.salaryBand.upsert({
      where: { companyId_code: { companyId: company.id, code: 'ENG-LEAD' } },
      update: {},
      create: {
        companyId: company.id,
        code: 'ENG-LEAD',
        title: 'Lead Engineer',
        level: SeniorityLevel.LEAD,
        minComp: 90000,
        maxComp: 140000,
        currency: 'USD'
      }
    }),
    prisma.salaryBand.upsert({
      where: { companyId_code: { companyId: company.id, code: 'PEOPLE-MID' } },
      update: {},
      create: {
        companyId: company.id,
        code: 'PEOPLE-MID',
        title: 'People Partner',
        level: SeniorityLevel.MID,
        minComp: 40000,
        maxComp: 75000,
        currency: 'USD'
      }
    })
  ]);

  const [seniorBand, leadBand, peopleBand] = salaryBands;

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-ENG-001' },
      update: {},
      create: {
        employeeCode: 'EMP-ENG-001',
        companyId: company.id,
        departmentId: engineeringDept.id,
        fullName: 'Linh Tran',
        firstName: 'Linh',
        lastName: 'Tran',
        email: 'linh.tran@novapeople.ai',
        jobTitle: 'Senior Software Engineer',
        seniority: SeniorityLevel.SENIOR,
        employmentType: EmploymentType.FULL_TIME,
        workArrangement: WorkArrangement.HYBRID,
        hireDate: new Date('2021-03-15'),
        annualSalary: 86000,
        currency: 'USD',
        locationId: hcmLocation.id,
        salaryBandId: seniorBand.id,
        skills: {
          create: [
            { primary: true, proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'React' }, create: { name: 'React', category: 'Frontend' } } } },
            { proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'Node.js' }, create: { name: 'Node.js', category: 'Backend' } } } },
            { proficiency: 'WORKING', skill: { connectOrCreate: { where: { name: 'GraphQL' }, create: { name: 'GraphQL', category: 'Backend' } } } }
          ]
        },
        performanceReviews: {
          create: [
            {
              reviewPeriod: '2023-Q4',
              reviewDate: new Date('2023-12-10'),
              overallScore: 88,
              performanceScore: 86,
              potentialScore: 90,
              engagementScore: 84,
              achievements: ['Scaled candidate matching service to handle 5x traffic'],
              focusAreas: ['Mentor junior engineers on AI integrations'],
              recommendations: ['Nominate for technical leadership program']
            }
          ]
        }
      }
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-ENG-002' },
      update: {},
      create: {
        employeeCode: 'EMP-ENG-002',
        companyId: company.id,
        departmentId: engineeringDept.id,
        fullName: 'Duy Nguyen',
        firstName: 'Duy',
        lastName: 'Nguyen',
        email: 'duy.nguyen@novapeople.ai',
        jobTitle: 'Lead Machine Learning Engineer',
        seniority: SeniorityLevel.LEAD,
        employmentType: EmploymentType.FULL_TIME,
        workArrangement: WorkArrangement.REMOTE,
        hireDate: new Date('2019-07-01'),
        annualSalary: 124000,
        currency: 'USD',
        locationId: singaporeLocation.id,
        salaryBandId: leadBand.id,
        skills: {
          create: [
            { primary: true, proficiency: 'EXPERT', skill: { connectOrCreate: { where: { name: 'Python' }, create: { name: 'Python', category: 'ML' } } } },
            { proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'TensorFlow' }, create: { name: 'TensorFlow', category: 'ML' } } } },
            { proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'MLOps' }, create: { name: 'MLOps', category: 'ML' } } } }
          ]
        },
        performanceReviews: {
          create: [
            {
              reviewPeriod: '2023-Q4',
              reviewDate: new Date('2023-12-12'),
              overallScore: 92,
              performanceScore: 94,
              potentialScore: 93,
              engagementScore: 88,
              achievements: ['Launched AI-assisted candidate scoring engine with 30% accuracy lift'],
              focusAreas: ['Formalize mentoring structure across squads'],
              recommendations: ['Shortlist for architecture council']
            }
          ]
        }
      }
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-PEOPLE-001' },
      update: {},
      create: {
        employeeCode: 'EMP-PEOPLE-001',
        companyId: company.id,
        departmentId: peopleDept.id,
        fullName: 'Thu Le',
        firstName: 'Thu',
        lastName: 'Le',
        email: 'thu.le@novapeople.ai',
        jobTitle: 'People Operations Manager',
        seniority: SeniorityLevel.MID,
        employmentType: EmploymentType.FULL_TIME,
        workArrangement: WorkArrangement.ONSITE,
        hireDate: new Date('2020-02-01'),
        annualSalary: 56000,
        currency: 'USD',
        locationId: hanoiLocation.id,
        salaryBandId: peopleBand.id,
        skills: {
          create: [
            { primary: true, proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'HR Analytics' }, create: { name: 'HR Analytics', category: 'People' } } } },
            { proficiency: 'WORKING', skill: { connectOrCreate: { where: { name: 'Employee Relations' }, create: { name: 'Employee Relations', category: 'People' } } } }
          ]
        },
        performanceReviews: {
          create: [
            {
              reviewPeriod: '2023-Q4',
              reviewDate: new Date('2023-12-08'),
              overallScore: 85,
              performanceScore: 83,
              potentialScore: 82,
              engagementScore: 89,
              achievements: ['Rolled out new onboarding workflow reducing ramp time by 15%'],
              focusAreas: ['Deepen analytics automation capability'],
              recommendations: ['Nominate for analytics upskilling track']
            }
          ]
        }
      }
    })
  ]);

  const [linh, duy, thu] = employees;

  await prisma.department.update({
    where: { id: engineeringDept.id },
    data: { headId: duy.id }
  });

  const benefits = await Promise.all([
    prisma.benefit.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Private Health Insurance' } },
      update: {},
      create: {
        companyId: company.id,
        name: 'Private Health Insurance',
        category: 'HEALTH',
        description: 'Comprehensive coverage for employees and dependents.'
      }
    }),
    prisma.benefit.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Learning Stipend' } },
      update: {},
      create: {
        companyId: company.id,
        name: 'Learning Stipend',
        category: 'DEVELOPMENT',
        description: 'Annual $1,500 budget for certifications and conferences.'
      }
    })
  ]);

  const [healthBenefit, learningBenefit] = benefits;

  await prisma.benefitEnrollment.createMany({
    data: [
      {
        employeeId: linh.id,
        benefitId: healthBenefit.id,
        status: 'ACTIVE',
        effectiveDate: new Date('2021-03-15')
      },
      {
        employeeId: linh.id,
        benefitId: learningBenefit.id,
        status: 'ACTIVE',
        effectiveDate: new Date('2021-03-15')
      },
      {
        employeeId: duy.id,
        benefitId: healthBenefit.id,
        status: 'ACTIVE',
        effectiveDate: new Date('2019-07-01')
      }
    ]
  });

  const candidates = await Promise.all([
    prisma.candidate.upsert({
      where: { candidateCode: 'CAN-ENG-001' },
      update: {},
      create: {
        candidateCode: 'CAN-ENG-001',
        fullName: 'Minh Chau',
        firstName: 'Minh',
        lastName: 'Chau',
        email: 'minh.chau@example.com',
        headline: 'Senior Frontend Engineer at Fintech startup',
        status: CandidateStatus.INTERVIEW,
        source: CandidateSource.REFERRAL,
        totalExperienceYears: 6.5,
        salaryExpectation: 78000,
        currency: 'USD',
        openToRemote: true,
        openToRelocation: false,
        resumeUrl: 'https://cdn.example.com/resume/minh-chau.pdf',
        resumeHighlights: ['Built design system serving 8 product squads', 'Leads accessibility guild'],
        locationId: hcmLocation.id,
        skills: {
          create: [
            { primary: true, proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'React' }, create: { name: 'React', category: 'Frontend' } } } },
            { proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'TypeScript' }, create: { name: 'TypeScript', category: 'Frontend' } } } },
            { proficiency: 'WORKING', skill: { connectOrCreate: { where: { name: 'Storybook' }, create: { name: 'Storybook', category: 'Frontend' } } } }
          ]
        },
        experiences: {
          create: [
            {
              companyName: 'FinEdge',
              title: 'Senior Frontend Engineer',
              startDate: new Date('2021-05-01'),
              responsibilities: ['Lead design system evolution', 'Mentor two mid-level engineers'],
              achievements: ['Reduced build times by 35%'],
              technologies: ['React', 'Storybook', 'Vite']
            }
          ]
        }
      }
    }),
    prisma.candidate.upsert({
      where: { candidateCode: 'CAN-DS-002' },
      update: {},
      create: {
        candidateCode: 'CAN-DS-002',
        fullName: 'Hoang Nguyen',
        firstName: 'Hoang',
        lastName: 'Nguyen',
        email: 'hoang.nguyen@example.com',
        headline: 'Data Scientist specializing in talent analytics',
        status: CandidateStatus.SCREENING,
        source: CandidateSource.JOB_BOARD,
        totalExperienceYears: 4.2,
        salaryExpectation: 65000,
        openToRemote: true,
        openToRelocation: true,
        locationId: hanoiLocation.id,
        skills: {
          create: [
            { primary: true, proficiency: 'ADVANCED', skill: { connectOrCreate: { where: { name: 'Python' }, create: { name: 'Python', category: 'Data' } } } },
            { proficiency: 'WORKING', skill: { connectOrCreate: { where: { name: 'dbt' }, create: { name: 'dbt', category: 'Data' } } } },
            { proficiency: 'WORKING', skill: { connectOrCreate: { where: { name: 'Tableau' }, create: { name: 'Tableau', category: 'Analytics' } } } }
          ]
        },
        experiences: {
          create: [
            {
              companyName: 'TalentData',
              title: 'Data Scientist',
              startDate: new Date('2020-08-01'),
              responsibilities: ['Developed predictive models for hiring funnel'],
              achievements: ['Raised interview-to-offer accuracy by 18%'],
              technologies: ['Python', 'scikit-learn']
            }
          ]
        }
      }
    })
  ]);

  const [minhCandidate, hoangCandidate] = candidates;

  const job = await prisma.jobPosting.upsert({
    where: { jobCode: 'FRONTEND-LEAD' },
    update: {},
    create: {
      jobCode: 'FRONTEND-LEAD',
      companyId: company.id,
      departmentId: engineeringDept.id,
      title: 'Lead Frontend Engineer',
      description:
        'Lead the evolution of the NovaPeople HR analytics experience and mentor a high-performing frontend guild.',
      status: 'OPEN',
      level: SeniorityLevel.LEAD,
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      openings: 1,
      locations: ['Ho Chi Minh City, Vietnam', 'Remote - Vietnam'],
      salaryMin: 95000,
      salaryMax: 135000,
      currency: 'USD',
      publishedAt: new Date('2024-02-01'),
      salaryBandId: leadBand.id,
      requirements: {
        create: [
          {
            type: 'MUST_HAVE',
            priority: 'CORE',
            description: 'React',
            skill: { connect: { name: 'React' } }
          },
          {
            type: 'MUST_HAVE',
            priority: 'CORE',
            description: 'TypeScript',
            skill: { connect: { name: 'TypeScript' } }
          },
          {
            type: 'NICE_TO_HAVE',
            priority: 'IMPORTANT',
            description: 'Design Systems',
            skill: { connectOrCreate: { where: { name: 'Design Systems' }, create: { name: 'Design Systems', category: 'Frontend' } } }
          },
          {
            type: 'RESPONSIBILITY',
            priority: 'CORE',
            description: 'Coach a squad of 4-6 engineers in modern frontend practices'
          }
        ]
      },
      benefits: {
        create: [
          { benefit: { connect: { id: healthBenefit.id } }, highlight: true },
          { benefit: { connect: { id: learningBenefit.id } }, highlight: true }
        ]
      }
    }
  });

  await prisma.jobApplication.upsert({
    where: { applicationCode: 'APP-LEAD-001' },
    update: {},
    create: {
      applicationCode: 'APP-LEAD-001',
      jobId: job.id,
      candidateId: minhCandidate.id,
      status: ApplicationStatus.INTERVIEW,
      source: CandidateSource.REFERRAL,
      resumeUrl: minhCandidate.resumeUrl,
      salaryExpectation: minhCandidate.salaryExpectation,
      currency: minhCandidate.currency,
      matchScore: 86,
      interviews: {
        create: [
          {
            stage: InterviewStage.TECHNICAL,
            scheduledAt: new Date('2024-03-20T03:00:00Z'),
            interviewers: ['Duy Nguyen', 'Linh Tran'],
            status: InterviewStatus.COMPLETED,
            feedback: {
              create: [
                {
                  interviewerName: 'Duy Nguyen',
                  rating: 4,
                  recommendation: HiringRecommendation.HIRE,
                  strengths: ['Strong UI architecture thinking'],
                  concerns: ['Needs deeper exposure to accessibility testing'],
                  summary: 'Great product mindset and mentorship examples.'
                }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.adminUser.upsert({
    where: { email: 'admin@novapeople.ai' },
    update: {},
    create: {
      email: 'admin@novapeople.ai',
      name: 'System Admin',
      role: 'owner'
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

