import {
  headerData,
  urlData,
  expect,
  logger,
  uploadMediaLibraryToWorkspacePayload,
} from "../../../path.js";

export async function uploadLibraryToWorkspaceApi(
  request,
  jwt,
  documents,
  workspaceId,
  projectId = null,
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");

    let response = await request.post(urlData.lxStudioGraphQLUrl, {
      data: uploadMediaLibraryToWorkspacePayload(
        documents,
        workspaceId,
        projectId,
      ),
      headers: headers,
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();

    if (
      responseData.data &&
      responseData.data.uploadMediaLibraryFiles?.length
    ) {
      logger.info(
        `Upload media library signed URL(s) generated successfully`,
      );
      return responseData;
    } else {
      logger.error(
        `Upload media library failed. Response: ${JSON.stringify(
          responseData,
        )}`,
      );
    }
  } catch (error) {
    logger.error(
      `Upload media library failed due to error: ${error.message}`,
    );
  }
}
