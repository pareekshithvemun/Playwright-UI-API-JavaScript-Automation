import {
  headerData,
  urlData,
  expect,
  logger,
  listMediaDocumentsPayload,
} from "../../../path.js";

export async function listMediaDocumentsApi(
  request,
  jwt,
  contentContainerIds,
  page = 1,
  limit = 50
) {
  const headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
  const payload = listMediaDocumentsPayload(
    contentContainerIds,
    page,
    limit
  );

  const res = await request.post(urlData.lxStudioGraphQLUrl, {
    data: payload,
    headers,
  });

  expect(res.status()).toBe(200);
  const resp = await res.json();
  if (!resp.data?.listMediaDocuments) {
    throw new Error("Invalid response structure from listMediaDocuments");
  }
  return resp;
}
