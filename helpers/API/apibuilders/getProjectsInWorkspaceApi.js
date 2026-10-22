import {
  headerData,
  urlData,
  expect,
  getProjectsInWorkspacePayload,
  logger,
} from "../../../path.js";

export async function getProjectsInWorkspaceApi(
  request,
  jwt,
  workspaceId,
  page,
  limit,
  onlyEditPlusAccess
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = getProjectsInWorkspacePayload(
      workspaceId,
      page,
      limit,
      onlyEditPlusAccess
    );

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Successfully retrieved projects for workspace ${workspaceId}`);
    return resp;
  } catch (error) {
    logger.error(
      `Failed to get projects in workspace ${workspaceId} due to ${error}`
    );
    throw error;
  }
}
