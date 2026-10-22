/**
 * Utility: print parent orgId and all child site org IDs (from Admin APIs).
 * Run: NODE_ENV=preval npm run listChildSites
 *   (or: npx playwright test tests/API/Admin/listChildSites.spec.js)
 */
import {
  test,
  expect,
  logger,
  config,
  generateTokenWithOrgId,
  fetchAllSitesApi,
  getMultiSitesHierarchyApi,
} from "../../../path.js";

test("List parent and child site org IDs", async ({ request }) => {
  const jwt = await generateTokenWithOrgId(request);
  const parentOrgId = config.get("Environment").orgId;
  const baseURL = config.get("Environment").baseURL;

  logger.info(`baseURL: ${baseURL}`);
  logger.info(`Parent orgId: ${parentOrgId}`);

  const sites = await fetchAllSitesApi(request, jwt);
  const childSites = sites
    .filter((site) => site.id !== parentOrgId)
    .map((site) => ({
      id: site.id,
      domain: site.domain ?? site.siteDomain ?? site.name ?? "",
    }))
    .sort((a, b) =>
      a.domain.localeCompare(b.domain, undefined, { numeric: true }),
    );

  logger.info(
    `--- Child sites (${childSites.length}) from fetch-all-sites ---`,
  );
  for (const site of childSites) {
    logger.info(`https://${site.domain}.percipio.com ${site.id}`);
  }

  // Cross-check count only (hierarchy API already logs parent summary in getMultiSitesHierarchyApi)
  const hierarchyResult = await getMultiSitesHierarchyApi(request, jwt, false);
  const parent = hierarchyResult.hierarchy[0];
  const hierarchyChildCount = parent?.children?.length ?? 0;

  expect(hierarchyChildCount).toBe(childSites.length);
  logger.info(
    `Cross-check: multi-sites hierarchy reports ${hierarchyChildCount} child site(s) (same as fetch-all-sites).`,
  );
});
