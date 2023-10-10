import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
} from "@aws-sdk/client-s3";
import { join } from 'path'

export async function uploadFileToS3(
  path: string,
  content: string,
): Promise<PutObjectCommandOutput> {
  const command = new PutObjectCommand({
    Body: content,
    Bucket: process.env.BACKEND_S3_BUCKETNAME,
    Key: join(process.env.NODE_ENV ?? "default", path),
    Expires: new Date(),
  });
  
  const s3Client = getClient();
  let answer: PutObjectCommandOutput;
  try {
    answer = await s3Client.send(command)
  } catch (err) {
    console.log(err)
    throw err;
  } finally {
    s3Client.destroy();
  }

  return answer;
}

function getClient(): S3Client {
  let config = { region: process.env.BACKEND_S3_REGION };

  if (
    process.env.BACKEND_S3_ACCESS_KEY &&
    process.env.BACKEND_S3_SECRET_KEY
  ) {
    config = {
      endpoint: process.env.BACKEND_S3_ENDPOINT,
      region: process.env.BACKEND_S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.BACKEND_S3_ACCESS_KEY ?? "",
        secretAccessKey: process.env.BACKEND_S3_SECRET_KEY ?? "",
      }
    }
  }

  return new S3Client(config);
}
