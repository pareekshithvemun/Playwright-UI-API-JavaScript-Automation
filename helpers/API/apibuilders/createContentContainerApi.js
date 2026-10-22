import {
  headerData,
  urlData,
  expect,
  logger,
  createContentContainerPayload,
} from "../../../path.js";

export async function createContentContainerApi(
  request,
  jwt,
  projectId,
  workspaceId,
  moduleType,
  locale = "en-US"
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = createContentContainerPayload(
      projectId,
      workspaceId,
      moduleType,
      locale
    );

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `Successfully created content container for project ${projectId}`
    );
    return resp.data.createContentContainer.id;
  } catch (error) {
    logger.error(
      `Failed to create content container for project ${projectId} due to ${error}`
    );
    throw error;
  }
}
