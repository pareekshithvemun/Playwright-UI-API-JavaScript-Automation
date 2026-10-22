import { headerData, urlData, upsertSectionAndRubricConfigurationPayload, expect, logger } from "../../../path.js";

export async function upsertSectionAndRubricConfigurationApi(request, jwt, conversationId, sectionsConfig, sectionRubrics, shouldIncrementVersion = true) {
  try {
    const payload = upsertSectionAndRubricConfigurationPayload(conversationId, sectionsConfig, sectionRubrics, shouldIncrementVersion);
    const response = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: payload,
      headers: headerData.caisyPresentationsGraphqlHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    logger.info(`Upsert section and rubric configuration successful for conversation: ${conversationId}`);
    return { success: true, response: responseData };
  } catch (error) {
    logger.error(`Error in upsertSectionAndRubricConfigurationApi: ${error.message}`);
    throw error;
  }
}
