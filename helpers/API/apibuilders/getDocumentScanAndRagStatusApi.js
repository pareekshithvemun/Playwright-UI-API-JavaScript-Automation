import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { getDocumentScanAndRagStatusPayload } from "../payloads/getDocumentScanAndRagStatusPayload.js";
import { logger } from "../../../logger.js";

export async function getDocumentScanAndRagStatusApi(
  request,
  jwt,
  documentIds
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");

    const response = await request.post(urlData.lxStudioGraphQLUrl, {
      data: getDocumentScanAndRagStatusPayload(documentIds),
      headers: headers,
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();

    if (responseData.data && responseData.data.getDocumentScanAndRagStatus) {
      logger.info(`Document scan and RAG status retrieved successfully`);
      return responseData;
    } else {
      logger.error(
        `Failed to retrieve document status. Response: ${JSON.stringify(
          responseData
        )}`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to get document scan and RAG status due to error: ${error.message}`
    );
  }
}
