import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client
} from "@aws-sdk/client-s3";
import config from "config";

export async function readFileFromS3(
  path: string,
): Promise<string | undefined> {
  const command = new GetObjectCommand({
    Bucket: "helm-viewer-computed-charts",
    Key: path,
  });
  
  const s3Client = getClient();
  let answer: GetObjectCommandOutput;
  try {
    answer = await s3Client.send(command)
  } catch (err) {
    console.log(err)
    throw err;
  }

  const content = await answer.Body.transformToString('utf-8');
  s3Client.destroy();

  return content
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
