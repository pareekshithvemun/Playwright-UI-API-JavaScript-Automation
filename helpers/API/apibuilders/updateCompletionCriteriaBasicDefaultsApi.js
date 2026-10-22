import { headerData, urlData, expect, completionCriteriaBasicDefaultsPayload, logger } from "../../../path.js";

export async function updateCompletionCriteriaBasicDefaultsApi(
  request,
  jwt,
  settings = {},
) {
  try {
    const response = await request.post(
      urlData.completionCriteriaBasicDefaultsUrl,
      {
        data: completionCriteriaBasicDefaultsPayload(settings),
        headers: headerData.completionCriteriaDefaultsHeaders(
          jwt,
          "application/json",
        ),
      },
    );
    expect(response.status()).toBe(201);
    logger.info(
      `Org completion criteria basic defaults updated (minimumTestScore=${settings.minimumTestScore ?? 70})`,
    );
    return { success: true };
  } catch (error) {
    logger.error(
      `Failed to update completion criteria basic defaults: ${error.message}`,
    );
    throw error;
  }
}
