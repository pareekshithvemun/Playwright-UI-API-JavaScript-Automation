import { headerData, urlData, expect, logger } from "../../../path.js";

export async function getOrganizationDetailsApi(request, jwt, organizationId) {
  try {
    const response = await request.get(
      `${urlData.getOrganizationDetailsUrl}/${organizationId}`,
      {
        headers: headerData.createChildSiteHeaders(jwt, "application/json"),
      }
    );

    expect(response.status()).toBe(200);
    const orgDetails = await response.json();

    logger.info(`Fetched organization details for org: ${orgDetails.orgName}`);
    logger.info(`  People Soft ID: ${orgDetails.peopleSoftId}`);
    logger.info(`  Domain UUID: ${orgDetails.domainUuid}`);

    return {
      success: true,
      peopleSoftId: orgDetails.peopleSoftId,
      domainUuid: orgDetails.domainUuid,
      orgDetails: orgDetails,
    };
  } catch (error) {
    logger.error(
      `Failed to fetch organization details for ${organizationId}: ${error.message}`
    );
    throw error;
  }
}
