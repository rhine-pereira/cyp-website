import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  } : undefined,
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET as string;
export const S3_PUBLIC_BASEURL = process.env.AWS_S3_PUBLIC_BASEURL as string | undefined;

// Talks-specific overrides: allow separate bucket and CDN domain for talks
export const TALKS_S3_BUCKET = (process.env.AWS_TALKS_S3_BUCKET || process.env.AWS_S3_BUCKET) as string;
export const TALKS_PUBLIC_BASEURL = (process.env.AWS_TALKS_PUBLIC_BASEURL || process.env.AWS_S3_PUBLIC_BASEURL) as string | undefined;
