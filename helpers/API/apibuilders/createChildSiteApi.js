import {
  headerData,
  expect,
  urlData,
  logger,
  createChildSitePayload,
} from "../../../path.js";

export async function createChildSiteApi(
  request,
  jwt,
  siteData,
  parentOrgId,
  peopleSoftId,
  domainUuid,
  licensePoolsFromApi,
  seatsPerPool,
) {
  try {
    const payload = createChildSitePayload(
      siteData,
      parentOrgId,
      peopleSoftId,
      domainUuid,
      licensePoolsFromApi,
      seatsPerPool,
    );
    const headers = headerData.createChildSiteHeaders(jwt, "application/json");

    const response = await request.post(urlData.createChildSiteUrl, {
      data: payload,
      headers: headers,
    });

    const responseData = await response.json();

    if (response.status() !== 200) {
      logger.error(`Child site creation failed for ${siteData.domain}`);
      logger.error(`Status: ${response.status()}`);
      logger.error(`Response: ${JSON.stringify(responseData, null, 2)}`);
      if (responseData.errors) {
        responseData.errors.forEach((err) => {
          logger.error(`Error Type: ${err.type}, Message: ${err.message}`);
        });
      }
    }

    expect(response.status()).toBe(200);

    return {
      success: true,
      orgName: payload.orgName,
      domain: payload.domain,
      adminEmail: payload.admin.email,
      orgId: responseData.orgId,
      licensePoolCount: licensePoolsFromApi.length,
      response: responseData,
    };
  } catch (error) {
    logger.error(
      `Failed to create child site ${siteData.domain}: ${error.message}`,
    );
    throw error;
  }
}
