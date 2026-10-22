import {
  urlData,
  headerData,
  publishContentCaisyPayload,
  logger,
  expect,
} from "../../../path.js";

export async function publishContentCaisyApi(
  request,
  jwt,
  contentContainerId,
  contentDetails
) {
  try {
    const url = urlData.lxStudioGraphQLUrl;
    const headers = headerData.lxStudioGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = publishContentCaisyPayload(contentContainerId, contentDetails);

    const response = await request.post(url, {
      headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    if (!resp.data?.publishContent) {
      throw new Error(
        `Invalid publishContent response: ${JSON.stringify(resp)}`
      );
    }

    const result = resp.data.publishContent;
    if (result.error) {
      throw new Error(`publishContent error: ${result.error}`);
    }

    logger.info(
      `Content published for container ${contentContainerId}: ${result.success}`
    );
    return resp;
  } catch (error) {
    logger.error(`Error in publishContentCaisyApi: ${error.message}`);
    throw error;
  }
}
