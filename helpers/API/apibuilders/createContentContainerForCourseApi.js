import {
  headerData,
  urlData,
  expect,
  logger,
  createContentContainerForCoursePayload,
} from "../../../path.js";

export async function createContentContainerForCourseApi(
  request,
  jwt,
  projectId,
  workspaceId,
  locale = "en-US"
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = createContentContainerForCoursePayload(
      projectId,
      workspaceId,
      locale
    );

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `Successfully created course content container for project ${projectId}`
    );
    return resp.data.createContentContainer.id;
  } catch (error) {
    logger.error(
      `Failed to create course content container for project ${projectId} due to ${error}`
    );
    throw error;
  }
}
