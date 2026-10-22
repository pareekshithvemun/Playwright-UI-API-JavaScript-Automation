import {
  urlData,
  headerData,
  getScenarioGroupsByOrgPayload,
  logger,
  expect,
} from "../../../path.js";

export async function getScenarioGroupsByOrgApi(
  request,
  jwt,
  orgId,
  includeStock = true
) {
  try {
    const url = urlData.aiSimulatorGraphqlUrl;
    const headers = headerData.aiSimulatorGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = getScenarioGroupsByOrgPayload(orgId, includeStock);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    // Validate response structure
    if (!resp.data || !resp.data.getScenarioGroupsByOrg) {
      throw new Error("Invalid response structure from getScenarioGroupsByOrg");
    }

    logger.info(
      `Fetched ${resp.data.getScenarioGroupsByOrg.length} scenario groups`
    );

    return resp;
  } catch (error) {
    logger.error(`Error in getScenarioGroupsByOrgApi: ${error.message}`);
    throw error;
  }
}
