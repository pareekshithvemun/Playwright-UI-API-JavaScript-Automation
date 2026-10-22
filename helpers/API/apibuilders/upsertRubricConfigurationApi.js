import {
  urlData,
  headerData,
  upsertRubricConfigurationPayload,
  logger,
  expect,
} from "../../../path.js";

export async function upsertRubricConfigurationApi(
  request,
  jwt,
  conversationId,
  sectionRubrics,
  shouldIncrementVersion = false
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = upsertRubricConfigurationPayload(
      conversationId,
      sectionRubrics,
      shouldIncrementVersion
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      `Upsert rubric configuration API called successfully for conversation: ${conversationId}`
    );
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in upsertRubricConfigurationApi: ${error.message}`);
    throw error;
  }
}
