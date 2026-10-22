/**
 * createAndShareContentToChildSites — API flow
 *
 * Content: testData/childSites/shareContentToSitesData.json
 * Sites:    getMultiSitesHierarchyApi → every child org id in `hierarchy[0].children`
 *
 * Share PUT replaces the whole `sharedTo` list. Any child omitted would lose the
 * share. Always pass every child org. FileName and SITE_NAME do not filter targets
 * (a leftover FileName from createChildSitesFromFile would unshare older children).
 *
 * Only published linked content is shared (reuse title when status is published;
 * otherwise create and publish from the JSON). Log parent published count and
 * child-site count, then share.
 *
 * npm run createAndShareContentToChildSites | ByDomains | FromFile
 */

import {
  test,
  expect,
  logger,
  config,
  jwt,
  generateTokenWithOrgId,
  createLinkedContent,
  publishLinkContent,
  getMultiSitesHierarchyApi,
  fetchAllLinkedContentSummaries,
  shareContentToSitesApi,
  reusableFunctions,
  getSkillIdsByNames,
} from "../../../path.js";

const testData = reusableFunctions.readJsonFile(
  "testData/childSites/shareContentToSitesData.json",
);

// --- Helpers (pure + createAllContent; no Playwright fixtures) ---

// Live children on the parent — the only safe sharedTo list for the replace PUT.
function allChildOrgIdsFromHierarchy(hierarchy, parentOrgId) {
  const parentSite = hierarchy?.[0];
  if (parentSite?.id && parentSite.id !== parentOrgId) {
    logger.error(
      `Hierarchy root id ${parentSite.id} does not match config orgId ${parentOrgId}.`,
    );
  }
  return (parentSite?.children ?? []).map((c) => c.id).filter(Boolean);
}

async function createAllContent(request, jwtTokenForApi) {
  const existingContent = await fetchAllLinkedContentSummaries(
    request,
    jwtTokenForApi,
  );
  const existingMap = new Map(
    existingContent
      .filter((item) => item.status === 2)
      .map((item) => [
        (item.title || "").trim().toLowerCase(),
        item.linkedContentUuid,
      ]),
  );
  logger.info(`Found ${existingMap.size} existing published content items`);

  const contentPromises = testData.map(async (contentData) => {
    const existingUuid = existingMap.get(
      (contentData.title || "").trim().toLowerCase(),
    );
    if (existingUuid) {
      logger.info(`EXISTS: "${contentData.title}" -> ${existingUuid}`);
      return { uuid: existingUuid, title: contentData.title };
    }

    let skillIds = [];
    if (contentData.skills && contentData.skills.length > 0) {
      skillIds = await getSkillIdsByNames(
        request,
        jwtTokenForApi,
        contentData.skills,
      );
      logger.info(
        `Skills for "${contentData.title}": ${skillIds.length}/${
          contentData.skills.length
        } resolved (${contentData.skills.length - skillIds.length} not found)`,
      );
    }
    const contentUuid = await createLinkedContent(
      request,
      jwtTokenForApi,
      contentData.title,
      contentData.contentUrl,
      contentData.desc,
      contentData.imageUrl,
      contentData.modality,
      contentData.duration,
      skillIds,
      contentData.sourceName,
    );
    await publishLinkContent(request, jwtTokenForApi, contentUuid);
    logger.info(`CREATED: "${contentData.title}" -> ${contentUuid}`);
    return { uuid: contentUuid, title: contentData.title };
  });

  const items = await Promise.all(contentPromises);
  const newlyPublishedCount = items.filter(
    (item) => !existingMap.has((item.title || "").trim().toLowerCase()),
  ).length;
  return {
    items,
    publishedOnParent: existingMap.size + newlyPublishedCount,
  };
}

// --- Suite state (filled in beforeAll; read by share tests) ---

let jwtToken;
let parentOrgId;
let parentOrgUserId;
let createdContentUuids = [];
let hierarchySites = [];
let childSiteIds = [];

test.describe("Create and share content to child sites", () => {
  test.setTimeout(180000);

  test.beforeAll(
    "JWT, linked content, hierarchy, child org ids",
    async ({ request }) => {
      test.setTimeout(180000);
      jwtToken = await generateTokenWithOrgId(request);
      parentOrgId = config.get("Environment").orgId;
      const decoded = jwt.decode(jwtToken);
      parentOrgUserId = decoded.org_user_id;
      logger.info(`Parent Org ID: ${parentOrgId}`);
      logger.info(`User ID: ${parentOrgUserId}`);

      logger.info("Setup: content + hierarchy (parallel)...");
      const [contentResults, hierarchyResult] = await Promise.all([
        createAllContent(request, jwtToken),
        getMultiSitesHierarchyApi(request, jwtToken, false),
      ]);

      createdContentUuids = contentResults.items;
      hierarchySites = hierarchyResult.hierarchy ?? [];

      const childSitesFile = process.env.FileName?.trim();
      const siteNameList = process.env.SITE_NAME?.trim();
      if (childSitesFile || siteNameList) {
        logger.info(
          "FileName and SITE_NAME do not change share targets. The share API replaces the site list, so this run shares to every child site.",
        );
      }

      childSiteIds = allChildOrgIdsFromHierarchy(hierarchySites, parentOrgId);

      expect(createdContentUuids.length).toBe(testData.length);
      expect(hierarchySites.length).toBeGreaterThan(0);
      expect(hierarchySites[0]?.id).toBe(parentOrgId);

      logger.info(
        `Parent has ${contentResults.publishedOnParent} published linked content item(s). Planning to share ${createdContentUuids.length} item(s) to ${childSiteIds.length} child site(s).`,
      );
    },
  );

  testData.forEach((contentData) => {
    test(`Share: ${contentData.title}`, async ({ request }) => {
      test.skip(childSiteIds.length === 0, "No child sites available");

      const contentItem = createdContentUuids.find(
        (item) => item.title === contentData.title,
      );
      if (!contentItem) {
        throw new Error(`Content "${contentData.title}" was not created`);
      }

      const result = await shareContentToSitesApi(
        request,
        jwtToken,
        parentOrgUserId,
        parentOrgId,
        contentItem.uuid,
        childSiteIds,
      );

      expect(result.success).toBe(true);
      logger.info(
        `✅ Shared "${contentData.title}" to ${childSiteIds.length} site(s)`,
      );
    });
  });
});
