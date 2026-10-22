import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { uploadExternalDocumentsPayload } from "../payloads/uploadExternalDocumentsPayload.js";
import { logger } from "../../../logger.js";

export async function uploadExternalDocumentsApi(
  request,
  jwt,
  documents,
  workspaceId,
  projectId,
  contentContainerId
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");

    let response = await request.post(urlData.lxStudioGraphQLUrl, {
      data: uploadExternalDocumentsPayload(
        documents,
        workspaceId,
        projectId,
        contentContainerId
      ),
      headers: headers,
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();

    if (responseData.data && responseData.data.uploadExternalDocuments) {
      logger.info(`Upload documents url generated successfully`);
      return responseData;
    } else {
      logger.error(
        `Upload documents url generation failed. Response: ${JSON.stringify(
          responseData
        )}`
      );
    }
  } catch (error) {
    logger.error(
      `Upload documents url generation failed due to error: ${error.message}`
    );
  }
}
