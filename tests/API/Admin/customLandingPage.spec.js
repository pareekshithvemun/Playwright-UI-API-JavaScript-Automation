/**
 * Custom Landing Page Creation Tests (✅ SINGLE-STEP WORKFLOW)
 *
 * Features:
 * - ✅ AUTO-DETECTS: Accepts BOTH API response format AND test data format
 * - ✅ AUTO-CONVERTS: Strips unnecessary fields and replaces hardcoded URLs
 * - Nested child pages (parent → child → grandchild hierarchy)
 * - Dynamic page linking: {{CHILD_PAGE:PageTitle}} → actual URLs
 * - URL Format: {baseURL}/custom-pages/{ROOT_UUID}/{CHILD_UUID}
 *
 * Usage:
 * 1. Copy API response from any environment (dev/prod/demoprep/etc.)
 * 2. Paste directly in customLandingPageData.json (wrap in array)
 * 3. Run: npm run createCustomLandingPages
 * 4. Pages created in presales1 (or whatever NODE_ENV is set to)
 *
 * Audience (root): **AUDIENCE_NAME** env (package.json default for npm run: Region), else first
 * **audienceName** in the JSON array. Resolved once in beforeAll via getAllAudienceApi.
 *
 * ✅ URLs automatically updated to match target environment!
 * No manual conversion needed!
 */

import {
  test,
  generateToken,
  logger,
  saveCustomLandingPagePayload,
  resolveCustomContentUuids,
  saveCustomLandingPageApi,
  getAllUserApi,
  getAllAudienceApi,
  reusableFunctions,
  config,
} from "../../../path.js";

let jwt, adminUserId, baseURL, audienceUuid;

let fileName = process.env.FileName || "customLandingPageData";
let audienceName = process.env.AUDIENCE_NAME?.trim();
let customLandingPageDataPath = reusableFunctions.getPath(
  "testData/customLandingPages",
  `${fileName}.json`,
);
let customLandingPageData = reusableFunctions.readDatafromJsonFilenotasync(
  customLandingPageDataPath,
);

test.describe.configure({ mode: "parallel" });

test.beforeAll(
  "Generate token and get admin user",
  async ({ request }, testInfo) => {
    testInfo.setTimeout(60000);
    jwt = await generateToken(request);
    const allUserResponse = await getAllUserApi(request, jwt);
    adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
    baseURL = config.get("Environment").baseURL;
    logger.info(`Admin User ID: ${adminUserId}`);
    logger.info(`Base URL: ${baseURL}`);
    if (audienceName) {
      audienceUuid = await getAllAudienceApi(audienceName, request, jwt);
    }
  },
);

test.describe("Custom Landing Page Creation", () => {
  customLandingPageData.forEach((pageData) => {
    test(`Create custom landing page: ${pageData.title}`, async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(200000);

      const payload = saveCustomLandingPagePayload(
        pageData,
        adminUserId,
        baseURL,
        audienceUuid ? { audienceUuid } : undefined,
      );

      await resolveCustomContentUuids(request, jwt, pageData, payload);

      logger.info(
        `Creating page: ${pageData.title} with ${
          pageData.childPages?.length || 0
        } child pages`,
      );

      logPageStructure(payload, 0);
      verifyUrlReplacement(payload);

      const response = await saveCustomLandingPageApi(request, jwt, payload);
      logger.info(`Successfully created page: ${pageData.title}`);
    });
  });
});

/**
 * Logs page hierarchy structure with UUIDs
 */
function logPageStructure(page, level) {
  const indent = "  ".repeat(level);
  logger.info(`${indent}Page: ${page.title} (UUID: ${page.pageUuid})`);

  if (page.parentPageUuid) {
    logger.info(`${indent}  Parent UUID: ${page.parentPageUuid}`);
  }

  if (page.childPages?.length) {
    logger.info(`${indent}  Child Pages: ${page.childPages.length}`);
    page.childPages.forEach((child) => logPageStructure(child, level + 1));
  }
}

/**
 * Verifies that all placeholders were replaced with actual URLs
 */
function verifyUrlReplacement(page) {
  if (page.templateData?.includes("{{CHILD_PAGE:")) {
    logger.error(`❌ Placeholder NOT replaced in: ${page.title}`);
    throw new Error(`Placeholder not replaced in ${page.title}`);
  }

  if (page.templateData?.includes("/custom-pages/")) {
    const urlMatches = page.templateData.match(
      /\/custom-pages\/[a-f0-9-]+\/[a-f0-9-]+/g,
    );
    if (urlMatches) {
      logger.info(`✅ Verified ${urlMatches.length} URL(s) in: ${page.title}`);
    }
  }

  page.childPages?.forEach((child) => verifyUrlReplacement(child));
}
