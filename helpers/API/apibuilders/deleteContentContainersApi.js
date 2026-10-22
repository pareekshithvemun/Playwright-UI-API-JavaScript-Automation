import {
  headerData,
  urlData,
  expect,
  logger,
  deleteContentContainersPayload,
} from "../../../path.js";

export async function deleteContentContainersApi(
  request,
  jwt,
  containerId,
  workspaceId
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = deleteContentContainersPayload(containerId, workspaceId);

    let res = await request.post(urlData.lxStudioGraphQLUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();

    // Validate response structure
    if (
      !resp.data ||
      !resp.data.deleteContentContainers ||
      !resp.data.deleteContentContainers.success
    ) {
      throw new Error(
        `Failed to delete container: ${
          resp.data?.deleteContentContainers?.message || "Unknown error"
        }`
      );
    }

    logger.info(`Successfully deleted content container ${containerId}`);
    return resp;
  } catch (error) {
    logger.error(
      `Failed to delete content container ${containerId} due to ${error}`
    );
    throw error;
  }
}
