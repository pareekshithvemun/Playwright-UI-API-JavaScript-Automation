import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { createLocationPayload } from "../payloads/createLocationPayload.js";

export async function createLocation(request, token, name) {
  try {
    let headersOfcreateLocation = headerData.createLocationHeaders(
      token,
      "application/json"
    );
    let respOfcreateLocation = await request.post(urlData.createLocationUrl, {
      data: createLocationPayload(name),
      headers: headersOfcreateLocation,
    });
    expect(respOfcreateLocation.status()).toBe(200);
    let resp = await respOfcreateLocation.json();
    let locationUuid = resp.locationUuid;
    return locationUuid;
  } catch (error) {
    logger.error(`Failed to create location ${name} due to error : ${error}`);
  }
}
