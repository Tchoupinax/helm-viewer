import { defineEventHandler, getQuery } from "h3";

import { readFileFromS3 } from "../infrastructure/read-from-s3";

export default defineEventHandler(async (event) => {
  const { chartId } = getQuery(event);
  const payload = await readFileFromS3(chartId as string);

  let content = payload;
  if (typeof payload === "string") {
    content = JSON.parse(payload);
  }

  return content;
});
