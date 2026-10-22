import {
  headerData,
  urlData,
  expect,
  initializeConversationUploadPayload,
  logger,
} from "../../../path.js";

export async function initializeConversationUploadApi(
  request,
  jwt,
  contentType,
  fileName,
  uuid,
  source = "lx-studio"
) {
  try {
    let headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    let payload = initializeConversationUploadPayload(
      contentType,
      fileName,
      uuid,
      source
    );

    let res = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `Successfully initialized conversation upload for file ${fileName}`
    );
    return resp;
  } catch (error) {
    logger.error(
      `Failed to initialize conversation upload for file ${fileName} due to ${error}`
    );
    throw error;
  }
}
