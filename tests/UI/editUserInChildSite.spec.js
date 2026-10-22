/**
 * ============================================================================
 * FILTERING LOGIC - editUserInChildSite
 * ============================================================================
 *
 * Data Source: testData/childSites/<FileName>.json (default: childSitesConfig)
 *
 * FILTERS APPLIED:
 * ┌─────────────────────────────────────┬────────────────────────────────────┐
 * │ Filter                              │ Description                        │
 * ├─────────────────────────────────────┼────────────────────────────────────┤
 * │ parentUrl === BASE_URL              │ Child sites belonging to parent    │
 * │ domain in SITE_NAME                │ Only if SITE_NAME env var is set    │
 * └─────────────────────────────────────┴────────────────────────────────────┘
 *
 * RESULT:
 * - Without SITE_NAME            → Edits admin user in ALL child sites of current parent
 * - With SITE_NAME (single)      → Edits admin user in ONE specified site
 * - With SITE_NAME (comma-sep)   → Edits admin user in the listed sites only
 * - With **FileName**            → Loads sites from a specific JSON file (basename)
 *
 * PARALLELISM:
 * - Each child site runs as a separate test
 * - Use --workers=N to run N sites in parallel (e.g., --workers=5 runs 5 sites at once)
 *
 * USAGE:
 * npm run editUserInChildSite           (all child sites of current parent)
 * npm run editUserInChildSiteSpecific   (single: SITE_NAME=proservices041)
 * npm run editUserInChildSiteSites      (multiple: SITE_NAME=proservices041,proservices042)
 * npm run editUserInChildSiteFromFile   (uses **FileName** env var)
 *
 * ============================================================================
 */

import {
  test,
  expect,
  config,
  logger,
  reusableFunctions,
  loginLPUiPage,
  homePageAdmin,
  userManagement,
  siteManagement,
} from "../../path.js";

const childSitesFileName = process.env.FileName || "childSitesConfig";
const allChildSites = reusableFunctions.readJsonFile("testData/childSites", childSitesFileName);
const BASE_URL = config.get("Environment").baseURL;
const SITE_MANAGEMENT_URL = `${BASE_URL}/admin/sites`;
const SITE_NAME = process.env.SITE_NAME;

const EDIT_USER_CONFIG = {
  newPassword: config.get("Admindata").password,
  enableLXDesignStudioAccess: true,
  enablePublishFromLXDesignStudio: true,
};

// Filter sites by parent URL and optional site name(s) — SITE_NAME: single domain or comma-separated list
let childSites = allChildSites.filter((site) => site.parentUrl === BASE_URL);

if (SITE_NAME) {
  const allowedDomains = SITE_NAME.split(",").map((s) => s.trim()).filter(Boolean);
  childSites = childSites.filter((site) => allowedDomains.includes(site.domain));
  logger.info(`Filtering for site(s): ${allowedDomains.join(", ")} (${childSites.length} match(es))`);
}

childSites = childSites.map((site) => ({
  siteName: site.orgName,
  siteDomain: site.domain,
  userToEdit: site.admin.firstName,
  userEmail: site.admin.email,
  newPassword: EDIT_USER_CONFIG.newPassword,
  enableLXDesignStudioAccess: EDIT_USER_CONFIG.enableLXDesignStudioAccess,
  enablePublishFromLXDesignStudio:
    EDIT_USER_CONFIG.enablePublishFromLXDesignStudio,
}));

logger.info(`Found ${childSites.length} child site(s) to process`);

test.describe("Edit User in Child Sites", () => {
  // Enable parallel execution - each site can run simultaneously with different workers
  test.describe.configure({ mode: "parallel" });

  // Each child site runs as a separate test, workers will parallelize across sites
  for (const site of childSites) {
    test(`Edit user in ${site.siteDomain}`, async ({ browser }, testInfo) => {
      testInfo.setTimeout(300000); // 5 minutes per site

      const page = await browser.newPage();
      const loginLPUiPageObj = new loginLPUiPage(page);
      const homePageAdminObj = new homePageAdmin(page);
      const userManagementObj = new userManagement(page);
      const siteManagementObj = new siteManagement(page);

      try {
        // Step 1: Navigate and Login
        logger.info(`${site.siteDomain}: Starting test`);
        await page.goto(SITE_MANAGEMENT_URL, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await loginLPUiPageObj.login(
          config.get("Admindata").loginID,
          config.get("Admindata").password
        );
        logger.info(`${site.siteDomain}: Login successful`);

        // Step 2: Verify Site Management page
        await siteManagementObj.verifySiteManagementPage();
        logger.info(`${site.siteDomain}: Site Management page verified`);

        // Step 3: Click Go to site
        await siteManagementObj.clickGoToSite(site.siteDomain);
        logger.info(`${site.siteDomain}: Clicked Go to site`);

        // Step 4: Verify navigation to child site
        await page.waitForLoadState("domcontentloaded");
        const currentUrl = page.url();
        expect(currentUrl.toLowerCase()).toContain(
          `${site.siteDomain}.percipio.com`
        );
        logger.info(`${site.siteDomain}: Navigated to ${currentUrl}`);

        // Step 5: Ensure Admin view
        await homePageAdminObj.ensureAdminView();
        logger.info(`${site.siteDomain}: Admin view enabled`);

        // Step 6: Navigate to User Management
        await homePageAdminObj.clickUserButton();
        await homePageAdminObj.tapOnUserManagement();
        logger.info(`${site.siteDomain}: User Management page opened`);

        // Step 7: Search for user
        await userManagementObj.searchUser(site.userToEdit);
        logger.info(`${site.siteDomain}: Searched for ${site.userToEdit}`);

        // Step 8: Click Edit User
        await userManagementObj.clickActionsButtonForUser(site.userToEdit);
        await userManagementObj.clickEditUser();
        logger.info(
          `${site.siteDomain}: Opened Edit User for ${site.userToEdit}`
        );

        // Step 9: Verify Edit User page
        await page.waitForLoadState("domcontentloaded");
        expect(page.url()).toContain("/edit");
        logger.info(`${site.siteDomain}: Edit User page displayed`);

        // Step 10: Enter password and enable options
        await userManagementObj.enterPassword(site.newPassword);
        logger.info(`${site.siteDomain}: Password entered`);

        if (site.enableLXDesignStudioAccess) {
          await userManagementObj.enableAccessToLXDesignStudio();
          logger.info(`${site.siteDomain}: LX Design Studio access enabled`);
        }

        if (site.enablePublishFromLXDesignStudio) {
          await userManagementObj.enablePublishContentFromLXDesignStudio();
          logger.info(
            `${site.siteDomain}: Publish from LX Design Studio enabled`
          );
        }

        // Step 11: Click Update button
        await userManagementObj.clickUpdateButton();
        logger.info(
          `${site.siteDomain}: User ${site.userToEdit} updated successfully`
        );
      } finally {
        // Cleanup: Close page
        if (page && !page.isClosed()) {
          await page.close();
        }
      }
    });
  }
});
