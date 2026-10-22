import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function saveCustomLandingPageApi(request, jwt, payload) {
  try {
    const headers = headerData.saveCustomLandingPageHeaders(
      jwt,
      "application/json"
    );

    const res = await request.post(urlData.saveCustomLandingPageUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `Custom landing page created: ${payload.title} with UUID: ${payload.pageUuid}`
    );

    return resp;
  } catch (error) {
    logger.error(
      `Failed to create custom landing page '${payload.title}' due to ${error}`
    );
    throw error;
  }
}
