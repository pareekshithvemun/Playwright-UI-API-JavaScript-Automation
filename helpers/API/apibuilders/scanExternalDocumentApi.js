import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { scanExternalDocumentPayload } from "../payloads/scanExternalDocumentPayload.js";
import { logger } from "../../../logger.js";

export async function scanExternalDocumentApi(request, jwt, documentIds) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");

    const response = await request.post(urlData.lxStudioGraphQLUrl, {
      data: scanExternalDocumentPayload(documentIds),
      headers: headers,
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();

    if (responseData.data && responseData.data.scanExternalDocument) {
      logger.info(`External document scanned successfully`);
      return responseData;
    } else {
      logger.error(
        `External document scan failed. Response: ${JSON.stringify(
          responseData
        )}`
      );
    }
  } catch (error) {
    logger.error(
      `External document scan failed due to error: ${error.message}`
    );
  }
}
