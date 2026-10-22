import {
  headerData,
  urlData,
  expect,
  logger,
  skillsIntelligenceOrgSettingsPayload,
} from "../../../path.js";

// Admin Bearer PATCH. Turns Career Center on without rewriting other site settings.
export async function skillsIntelligenceOrgSettingsApi(request, jwt) {
  try {
    const response = await request.patch(urlData.orgSettingsUrl, {
      data: skillsIntelligenceOrgSettingsPayload(),
      headers: headerData.orgSettingsHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    logger.info("Career Center org settings were turned on");
    return await response.json();
  } catch (error) {
    logger.error("Could not turn on Career Center for this org");
    throw error;
  }
}
