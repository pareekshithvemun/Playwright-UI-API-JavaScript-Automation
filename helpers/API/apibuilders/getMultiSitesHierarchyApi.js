import { headerData, urlData, expect, logger } from "../../../path.js";

export async function getMultiSitesHierarchyApi(
  request,
  jwt,
  filterInactiveSites = false
) {
  try {
    const response = await request.get(
      `${urlData.getMultiSitesHierarchyUrl}?filterInactiveSites=${filterInactiveSites}`,
      {
        headers: headerData.createChildSiteHeaders(jwt, "application/json"),
      }
    );

    expect(response.status()).toBe(200);
    const hierarchyData = await response.json();

    logger.info(
      `Fetched multi-sites hierarchy for domain: ${hierarchyData.currentSiteDomain}`
    );
    logger.info(`  Total parent sites: ${hierarchyData.hierarchy.length}`);

    if (hierarchyData.hierarchy.length > 0) {
      const parentSite = hierarchyData.hierarchy[0];
      const childCount = parentSite.children ? parentSite.children.length : 0;
      logger.info(`  Parent: ${parentSite.name} (${parentSite.domain})`);
      logger.info(`  Child sites: ${childCount}`);
    }

    return {
      success: true,
      currentSiteDomain: hierarchyData.currentSiteDomain,
      hierarchy: hierarchyData.hierarchy,
      response: hierarchyData,
    };
  } catch (error) {
    logger.error(`Failed to fetch multi-sites hierarchy: ${error.message}`);
    throw error;
  }
}
