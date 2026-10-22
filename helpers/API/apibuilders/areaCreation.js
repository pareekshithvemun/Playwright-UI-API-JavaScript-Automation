import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { createcustomArea } from "../../API/payloads/createCustomAreapayload.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { logger } from "../../../logger.js";

export async function createArea(
  request,
  jwt,
  areaName,
  areaImage,
  areaDescription
) {
  try {
    let uuid = reusableFunctions.uuidGenerator();
    let headerofcustomArea = headerData.customiseAreaHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.customAreaUrl(uuid), {
      data: createcustomArea(areaName, areaImage, true, areaDescription),
      headers: headerofcustomArea,
    });

    logger.info(res);
    expect(res.status()).toBe(200);
    const resp = await res.json();
    const text = resp["message"];
    logger.info(text);
  } catch (error) {
    logger.info(`Failed to Create Area due to ${error}`);
  }
}
