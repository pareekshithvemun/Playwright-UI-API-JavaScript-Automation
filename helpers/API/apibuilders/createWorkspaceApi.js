import {
  urlData,
  headerData,
  createWorkspacePayload,
  logger,
  expect,
} from "../../../path.js";

export async function createWorkspaceApi(request, jwt, workspaceName) {
  try {
    const url = urlData.lxStudioGraphQLUrl;
    const headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    const payload = createWorkspacePayload(workspaceName);

    let response = await request.post(url, {
      headers: headers,
      data: payload,
    });
    expect(response.status()).toBe(200);
    logger.info(`WorkSpace created successfully with name: ${workspaceName}`);
    let resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in createWorkspaceApi: ${error.message}`);
  }
}
