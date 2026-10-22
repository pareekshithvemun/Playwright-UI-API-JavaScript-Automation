import {
  headerData,
  urlData,
  expect,
  listWorkspacesPayload,
  logger,
} from "../../../path.js";

export async function listWorkspacesApi(request, jwt) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = listWorkspacesPayload();

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Successfully retrieved list of workspaces`);
    return resp;
  } catch (error) {
    logger.error(`Failed to get list of workspaces due to ${error}`);
    throw error;
  }
}
