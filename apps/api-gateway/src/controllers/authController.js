const argon2 = require('argon2');
const { z } = require('zod');
const prisma = require('../prisma');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/token');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(['ADMIN', 'HR', 'CANDIDATE']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const register = async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await argon2.hash(payload.password);
  const role = payload.role || 'CANDIDATE';

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      fullName: payload.fullName,
      role,
      ...(role === 'CANDIDATE'
        ? { candidate: { create: {} } }
        : {}),
      ...(role === 'HR'
        ? { hrProfile: { create: {} } }
        : {})
    },
    include: {
      candidate: true,
      hrProfile: true
    }
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email, fullName: user.fullName });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      candidateId: user.candidate?.id || null,
      hrProfileId: user.hrProfile?.id || null
    }
  });
};

const login = async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      candidate: true,
      hrProfile: true
    }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const passwordMatch = await argon2.verify(user.passwordHash, payload.password);
  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email, fullName: user.fullName });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      candidateId: user.candidate?.id || null,
      hrProfileId: user.hrProfile?.id || null
    }
  });
};

const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      candidate: true,
      hrProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    candidate: user.candidate,
    hrProfile: user.hrProfile
  });
};

module.exports = {
  register,
  login,
  me
};