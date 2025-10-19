const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hrms',
  jwtSecret: process.env.JWT_SECRET || 'change-me-super-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  minio: {
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    region: process.env.MINIO_REGION || 'us-east-1',
    bucket: process.env.MINIO_BUCKET || 'cv-private',
    endPoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    presignExpirySeconds: process.env.MINIO_PRESIGN_EXPIRY ? parseInt(process.env.MINIO_PRESIGN_EXPIRY, 10) : 300
  }
};

module.exports = env;