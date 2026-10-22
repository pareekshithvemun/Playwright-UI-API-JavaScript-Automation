import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { certificationPathPayload } from "../../API/payloads/certificationPathPayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";

export async function createCertificationPathApi(
  request,
  jwt,
  journeyName,
  journeyDescription,
  journeyImage,
  proofOfCertificationNeeded
) {
  try {
    let uuid = reusableFunctions.uuidGenerator();
    let headerDataofCreateCertificationPath =
      headerData.createCertificationPathHeaders(jwt, "application/json");
    let res = await request.post(urlData.createJourneyUrl(uuid), {
      data: certificationPathPayload(
        uuid,
        journeyName,
        journeyDescription,
        journeyImage,
        proofOfCertificationNeeded
      ),
      headers: headerDataofCreateCertificationPath,
    });
    const resp = await res.json();
    logger.info(resp);
    expect(res.status()).toBe(200);
    if (resp["message"] === "channel created") {
      logger.info(`Journey ${journeyName} has been created`);
    }
  } catch (error) {
    logger.error(
      `Failed to create journey ${journeyName} due to ${JSON.stringify(error)}`
    );
  }
}
