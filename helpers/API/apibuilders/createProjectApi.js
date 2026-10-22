import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { createProjectPayload } from "../payloads/createProjectPayload.js";
import { logger } from "../../../logger.js";

export async function createProjectApi(request, jwt, workspaceId, projectName) {
  try {
    let headers = headerData.createProjectInWorkspaceHeaders(
      jwt,
      "application/json",
    );

    const response = await request.post(urlData.lxStudioGraphQLUrl, {
      data: createProjectPayload(workspaceId, projectName),
      headers: headers,
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();

    if (responseData.data && responseData.data.createProject) {
      logger.info(`Project created successfully with name: ${projectName}`);
      return responseData;
    } else {
      logger.error(
        `Project creation failed. Response: ${JSON.stringify(responseData)}`,
      );
    }
  } catch (error) {
    logger.error(
      `Project creation in workspace failed due to error: ${error.message}`,
    );
  }
}
