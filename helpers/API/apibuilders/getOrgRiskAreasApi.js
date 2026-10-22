import {
  headerData,
  urlData,
  getOrgRiskAreasPayload,
  expect,
  logger,
} from "../../../path.js";

export async function getOrgRiskAreasApi(request, jwt, orgUUID, locale = "en-US") {
  try {
    const response = await request.post(urlData.getOrgRiskAreasUrl, {
      data: getOrgRiskAreasPayload(orgUUID, locale),
      headers: headerData.getOrgRiskAreasHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const orgRiskAreas =
      responseBody?.[0]?.data?.orgRiskAreas ||
      responseBody?.data?.orgRiskAreas ||
      [];

    if (!orgRiskAreas.length) {
      throw new Error("getOrgRiskAreas returned no risk areas");
    }

    logger.info(`Fetched ${orgRiskAreas.length} org risk areas`);
    return orgRiskAreas;
  } catch (error) {
    logger.error(`Failed to fetch org risk areas: ${error.message}`);
    throw error;
  }
}
