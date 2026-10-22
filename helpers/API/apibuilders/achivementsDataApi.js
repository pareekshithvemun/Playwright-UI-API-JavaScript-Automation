import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { achievementsDataPayload } from "../payloads/achievementsDataPayload.js";

export async function achivementsDataApi(request, token) {
  try {
    let headersOfachivementsData = headerData.achievementsDataHeaders(
      token,
      "application/json"
    );
    let respOfachivementsData = await request.post(urlData.achivementsDataUrl, {
      data: achievementsDataPayload(),
      headers: headersOfachivementsData,
    });
    expect(respOfachivementsData.status()).toBe(200);
    const resp = await respOfachivementsData.json();
    return resp;
  } catch (error) {
    logger.info(`Failed to get achievements data due to error : ${error}`);
  }
}
