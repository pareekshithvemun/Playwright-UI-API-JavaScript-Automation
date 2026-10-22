import { headerData, urlData, expect, completionCriteriaAdvancedDefaultsPayload, logger } from "../../../path.js";

export async function updateCompletionCriteriaAdvancedDefaultsApi(
  request,
  jwt,
  settings = {},
) {
  try {
    const response = await request.post(
      urlData.completionCriteriaAdvancedDefaultsUrl,
      {
        data: completionCriteriaAdvancedDefaultsPayload(settings),
        headers: headerData.completionCriteriaDefaultsHeaders(
          jwt,
          "application/json",
        ),
      },
    );
    expect(response.status()).toBe(201);
    logger.info(
      `Org completion criteria advanced defaults updated (viewAllCourses=${settings.viewAllCourses ?? false})`,
    );
    return { success: true };
  } catch (error) {
    logger.error(
      `Failed to update completion criteria advanced defaults: ${error.message}`,
    );
    throw error;
  }
}
