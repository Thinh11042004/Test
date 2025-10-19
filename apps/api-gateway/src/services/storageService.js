const { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const env = require('../config/env');

const createS3Client = () => {
  const endpointUrl = new URL(env.minio.endPoint);
  return new S3Client({
    region: env.minio.region,
    endpoint: endpointUrl.origin,
    forcePathStyle: true,
    tls: env.minio.useSSL,
    credentials: {
      accessKeyId: env.minio.accessKey,
      secretAccessKey: env.minio.secretKey
    }
  });
};

const client = createS3Client();
let bucketEnsured = false;

const ensureBucket = async () => {
  if (bucketEnsured) return;
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.minio.bucket }));
    bucketEnsured = true;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) {
      await client.send(new CreateBucketCommand({ Bucket: env.minio.bucket }));
      bucketEnsured = true;
    } else if (err.name === 'NotFound' || err.Code === 'NoSuchBucket') {
      await client.send(new CreateBucketCommand({ Bucket: env.minio.bucket }));
      bucketEnsured = true;
    } else if (err.Code === 'BucketAlreadyOwnedByYou') {
      bucketEnsured = true;
    } else {
      throw err;
    }
  }
};

const createPresignedUpload = async ({ fileName, mimeType }) => {
  await ensureBucket();
  const key = `cv/${Date.now()}-${randomUUID()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.minio.bucket,
    Key: key,
    ContentType: mimeType
  });

  const url = await getSignedUrl(client, command, { expiresIn: env.minio.presignExpirySeconds });
  return { url, key };
};

module.exports = {
  createPresignedUpload
};