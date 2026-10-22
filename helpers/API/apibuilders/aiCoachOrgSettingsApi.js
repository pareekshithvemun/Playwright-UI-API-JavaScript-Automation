import {
  headerData,
  urlData,
  expect,
  logger,
  aiCoachOrgSettingsPayload,
} from "../../../path.js";

// Admin Bearer PATCH — turns AI Coach on without touching other org settings.
export async function aiCoachOrgSettingsApi(request, jwt, performanceCycleDates) {
  try {
    const response = await request.patch(urlData.orgSettingsUrl, {
      data: aiCoachOrgSettingsPayload(performanceCycleDates),
      headers: headerData.orgSettingsHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    logger.info("AI Coach org settings were turned on");
    return await response.json();
  } catch (error) {
    logger.error("Could not turn on AI Coach for this org");
    throw error;
  }
}
