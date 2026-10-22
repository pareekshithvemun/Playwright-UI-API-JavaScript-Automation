import {
  urlData,
  headerData,
  shareDocumentsToContainerPayload,
  logger,
} from "../../../path.js";

export async function shareDocumentsToContainerApi(
  request,
  jwt,
  documentIds,
  containerId
) {
  let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
  const response = await request.post(urlData.lxStudioGraphQLUrl, {
    headers: headers,
    data: shareDocumentsToContainerPayload(documentIds, containerId),
  });

  const responseBody = await response.json();
  logger.info(`Share Documents To Container API Status: ${response.status()}`);
  return responseBody;
}
