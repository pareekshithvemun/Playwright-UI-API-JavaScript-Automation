import { headerData, urlData, upsertPeopleGroupsAndQuestionsPayload, expect, logger } from "../../../path.js";

export async function upsertPeopleGroupsAndQuestionsApi(request, jwt, conversationId, peopleGroups, slideQuestions, shouldIncrementVersion = true) {
  try {
    const payload = upsertPeopleGroupsAndQuestionsPayload(conversationId, peopleGroups, slideQuestions, shouldIncrementVersion);
    const response = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: payload,
      headers: headerData.caisyPresentationsGraphqlHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    logger.info(`Upsert people groups and questions successful for conversation: ${conversationId}`);
    return { success: true, response: responseData };
  } catch (error) {
    logger.error(`Error in upsertPeopleGroupsAndQuestionsApi: ${error.message}`);
    throw error;
  }
}
