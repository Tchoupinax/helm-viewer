import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
} from "@aws-sdk/client-s3";
import config from "config";

export async function uploadFileToS3(
  path: string,
  content: string,
): Promise<PutObjectCommandOutput> {
  const command = new PutObjectCommand({
    Body: content,
    Bucket: "helm-viewer-computed-charts",
    Key: path,
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
  return new S3Client({
    endpoint: config.get('services.s3.endpoint'),
    region: config.get('services.s3.region'),
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.get('services.s3.accessKey'),
      secretAccessKey: config.get('services.s3.secretKey'),
    }
  });
}
