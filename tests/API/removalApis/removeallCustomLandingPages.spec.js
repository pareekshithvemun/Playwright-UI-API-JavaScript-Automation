import {
  test,
  generateToken,
  logger,
  fetchAllCustomLandingPagesApi,
  deleteCustomLandingPageApi,
} from "../../../path.js";

let jwt;

test.beforeAll("Generate token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all custom landing pages", async ({ request }, testInfo) => {
  testInfo.setTimeout(400000);

  // Fetch all custom landing pages
  const customLandingPages = await fetchAllCustomLandingPagesApi(request, jwt);

  // Filter pages with empty/null parentPageUuid (top-level pages only)
  const parentPagesToDelete = customLandingPages
    .filter((page) => !page.parentPageUuid || page.parentPageUuid === "")
    .map((page) => ({
      pageUuid: page.pageUuid,
      title: page.title || "Unknown",
    }));

  logger.info(
    `Found ${parentPagesToDelete.length} custom landing pages to delete`
  );
  logger.info(`Total pages in system: ${customLandingPages.length}`);

  // Delete each parent custom landing page (will cascade delete children)
  for (let page of parentPagesToDelete) {
    try {
      await deleteCustomLandingPageApi(request, jwt, page.pageUuid);
      logger.info(
        `Deleted custom landing page: ${page.title} (${page.pageUuid})`
      );
    } catch (error) {
      logger.info(
        `Failed to delete page ${page.title} (${page.pageUuid}): ${error}`
      );
    }
  }

  logger.info("All custom landing pages deleted successfully");
});
