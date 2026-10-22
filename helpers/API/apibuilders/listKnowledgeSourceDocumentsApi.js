import {
  urlData,
  headerData,
  listKnowledgeSourceDocumentsPayload,
  logger,
} from "../../../path.js";

export async function listKnowledgeSourceDocumentsApi(
  request,
  jwt,
  workspaceId,
  page,
  limit
) {
  let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
  const response = await request.post(urlData.lxStudioGraphQLUrl, {
    headers: headers,
    data: listKnowledgeSourceDocumentsPayload(workspaceId, page, limit),
  });

  const responseBody = await response.json();
  logger.info(
    `List Knowledge Source Documents API Status: ${response.status()}`
  );
  return responseBody;
}
