import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { getAllAudience } from "../../API/payloads/getAllAudiencepayload.js";
import { logger } from "../../../logger.js";

export async function getAllAudienceApi(audName, request, jwt) {
  try {
    let headerofGetAllAudience = headerData.getAllAudienceHeaders(
      jwt,
      "application/json",
    );
    let resofGetAllAudience = await request.post(
      urlData.baseUrlOfgetAllAudience,
      {
        data: getAllAudience(),
        headers: headerofGetAllAudience,
      },
    );
    expect(resofGetAllAudience.status()).toBe(200);
    const resp = await resofGetAllAudience.json();
    const audiences = resp?.audiences ?? [];
    const audId = audiences.find((item) => item.audienceName === audName);
    if (!audId) {
      logger.info(
        `No audience named "${audName}" in this org; cannot resolve audience UUID.`,
      );
      return undefined;
    }
    return audId.audienceUuid;
  } catch (error) {
    logger.error(
      `Failed to get AudienceId for ${audName} from Org due to error : ${JSON.stringify(error)}`,
    );
  }
}
