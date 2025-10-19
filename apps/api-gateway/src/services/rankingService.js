const prisma = require('../prisma');
const ApiError = require('../utils/apiError');
const { normalize, buildFrequencyMap, cosineSimilarity } = require('../utils/text');

const MAX_SKILL_BONUS = 25;
const BONUS_PER_SKILL = 5;

const buildDocumentTokens = (job, resume, candidate) => {
  const jobText = `${job.title} ${job.jdRaw} ${job.skills.join(' ')}`;
  const resumeText = [
    resume?.textContent,
    resume?.parsedJson ? JSON.stringify(resume.parsedJson) : '',
    resume ? `${resume.fileName} ${resume.mimeType}` : '',
    candidate?.headline,
    candidate?.bio,
    (candidate?.skills || []).join(' ')
  ]
    .filter(Boolean)
    .join(' ');

  const jobTokens = normalize(jobText);
  const resumeTokens = normalize(resumeText);

  return { jobTokens, resumeTokens };
};

const computeScore = (job, resume, candidate) => {
  const { jobTokens, resumeTokens } = buildDocumentTokens(job, resume, candidate);
  const jobVector = buildFrequencyMap(jobTokens);
  const resumeVector = buildFrequencyMap(resumeTokens);

  const cosine = cosineSimilarity(jobVector, resumeVector);
  const baseScore = Math.round(cosine * 100);

  const matchedSkills = [];
  const missingSkills = [];
  const jobSkills = job.skills || [];
  const candidateSkills = new Set([...(candidate?.skills || []), ...(resume?.parsedJson?.skills || [])]);

  jobSkills.forEach((skill) => {
    if (candidateSkills.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const bonus = Math.min(matchedSkills.length * BONUS_PER_SKILL, MAX_SKILL_BONUS);
  const score = Math.min(baseScore + bonus, 100);

  return {
    score,
    matchedSkills: matchedSkills.slice(0, 5),
    missingSkills: missingSkills.slice(0, 5)
  };
};

const getRankingForJob = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      applications: {
        include: {
          candidate: {
            include: {
              user: true
            }
          },
          resume: true
        }
      }
    }
  });

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  const items = job.applications.map((application) => {
    const { score, matchedSkills, missingSkills } = computeScore(job, application.resume, application.candidate);
    return {
      applicationId: application.id,
      candidateId: application.candidateId,
      candidateName: application.candidate.user ? application.candidate.user.fullName : undefined,
      cvId: application.resumeId,
      score,
      matchedSkills,
      missingSkills,
      status: application.status,
      submittedAt: application.createdAt
    };
  });

  items.sort((a, b) => b.score - a.score);

  return {
    jobId: job.id,
    jobTitle: job.title,
    items
  };
};

module.exports = {
  getRankingForJob
};