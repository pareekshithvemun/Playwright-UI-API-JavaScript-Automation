import {
  headerData,
  urlData,
  expect,
  logger,
  updateContentMetadataPayload,
} from "../../../path.js";

export async function updateContentMetadataApi(
  request,
  jwt,
  contentId,
  metadata,
  lang = "en-US"
) {
  const headers = headerData.aiContentGenContentMetadataHeaders(jwt, contentId);
  const payload = updateContentMetadataPayload(metadata);
  const url = urlData.getAiContentGenContentMetadataUrl(contentId, lang);

  const res = await request.put(url, {
    data: payload,
    headers,
  });

  expect(res.status()).toBe(200);
  const resp = await res.json();
  if (!resp.success) {
    throw new Error(resp.message || "Content metadata update failed");
  }
  logger.info(`Content metadata updated for ${contentId}`);
  return resp;
}
