import {
  headerData,
  urlData,
  expect,
  logger,
  aiContentGenStreamChatPayload,
} from "../../../path.js";

export async function aiContentGenStreamChatApi(
  request,
  jwt,
  containerId,
  messages,
  courseStep = "inputs",
  context = {}
) {
  try {
    let headers = headerData.aiContentGenStreamChatHeaders(jwt, containerId);
    let payload = aiContentGenStreamChatPayload(
      containerId,
      messages,
      courseStep,
      context
    );

    let res = await request.post(urlData.aiContentGenStreamChatUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `AI Content Gen stream chat successful for container ${containerId}`
    );
    return resp;
  } catch (error) {
    logger.error(
      `Failed AI Content Gen stream chat for container ${containerId} due to ${error}`
    );
    throw error;
  }
}
