import { defineEventHandler, readBody } from "h3";

import { uploadFileToS3 } from "../infrastructure/upload-to-s3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await uploadFileToS3(body.chartId, body.content);
  console.log("Chart uploaded!");

  return {
    chartId: body.chartId,
  };
});
