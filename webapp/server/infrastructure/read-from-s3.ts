import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client
} from "@aws-sdk/client-s3";

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
    endpoint: process.env.BACKEND_S3_ENDPOINT,
    region: process.env.BACKEND_S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.BACKEND_S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.BACKEND_S3_SECRET_KEY ?? "",
    }
  });
}
