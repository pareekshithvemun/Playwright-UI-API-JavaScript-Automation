import {
  headerData,
  urlData,
  expect,
  logger,
  listContentContainersPayload,
} from "../../../path.js";

export async function listContentContainersApi(
  request,
  jwt,
  workspaceId,
  page = 1,
  limit = 100,
  moduleType = null,
  createdByMe = false,
  projectId = null
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = listContentContainersPayload(
      workspaceId,
      page,
      limit,
      moduleType,
      createdByMe,
      projectId
    );

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();

    // Validate response structure
    if (!resp.data || !resp.data.listContentContainers) {
      throw new Error("Invalid response structure from listContentContainers");
    }

    logger.info(
      `Listed ${resp.data.listContentContainers.totalCount} content containers for workspace ${workspaceId}`
    );
    return resp;
  } catch (error) {
    logger.error(
      `Failed to list content containers for workspace ${workspaceId} due to ${error}`
    );
    throw error;
  }
}
