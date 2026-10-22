import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { grantCompletionBody } from "../../API/payloads/grantCompletionPayload.js";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../UI/commonFunctions.js";

export async function conentCompletionApi(
  request,
  jwt,
  orgid,
  adminUserId,
  contentToBeCompleted,
) {
  try {
    let headersOfContentCompletion = headerData.grantContentCompletionHeaders(
      jwt,
      "application/json",
    );
    let responseOfconentCompletionApi = await request.post(
      urlData.contentCompletionUrl,
      {
        data: grantCompletionBody(orgid, adminUserId, contentToBeCompleted),
        headers: headersOfContentCompletion,
      },
    );
    const resp = await responseOfconentCompletionApi.json();
    expect(responseOfconentCompletionApi.status()).toBe(200);
    logger.info(`*************succesfully completed content****************`);
    return resp;
  } catch (error) {
    const msg = reusableFunctions.removeAnsiCodes(
      error.message || String(error),
    );
    logger.error(`Content completion API failed: ${msg}`);
    return false;
  }
}
