import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.AWS_S3_BUCKET!;
const AWSACCESSKEYID = process.env.AWS_ACCESS_KEY_ID!;
const AWSSECRETACCESSKEY = process.env.AWS_SECRET_ACCESS_KEY!;

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: AWSACCESSKEYID,
    secretAccessKey: AWSSECRETACCESSKEY,
  },
});

export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

  return `${base}/${key}`;
}
