/**
 * ============================================================================
 * FILTERING LOGIC - createChildSites & createChildSitesOnlyNew
 * ============================================================================
 *
 * Data Source: testData/childSites/childSitesConfig.json
 *
 * FILTERS APPLIED:
 * ┌─────────────────────────────────────┬────────────────────────────────────┐
 * │ Filter                              │ Description                        │
 * ├─────────────────────────────────────┼────────────────────────────────────┤
 * │ parentUrl === BASE_URL              │ Only sites matching current env    │
 * │ createSiteInThisRun === true        │ Only if ONLY_NEW=true (optional)   │
 * └─────────────────────────────────────┴────────────────────────────────────┘
 *
 * COMMANDS:
 * - createChildSites         → Creates ALL sites for current parent URL
 * - createChildSitesOnlyNew  → Creates only sites where createSiteInThisRun=true
 * - createChildSitesFromFile → Creates sites from a specific JSON file
 *
 * USAGE:
 * npm run createChildSites              (all sites for current parent)
 * npm run createChildSitesOnlyNew       (only new sites, ONLY_NEW=true)
 * npm run createChildSitesFromFile      (uses **FileName** env var = basename under testData/childSites)
 *
 * ============================================================================
 */

// Import all required functions and utilities
import {
  test,
  expect,
  logger,
  config,
  generateTokenWithOrgId,
  apiresponseValidations,
  urlData,
  reusableFunctions,
  createChildSiteApi,
  getOrganizationDetailsApi,
  getMultiSitesHierarchyApi,
  getAllUserApi,
} from "../../../path.js";

// Load test data from JSON file (basename under testData/childSites via **FileName**)
const childSitesFileName = process.env.FileName || "childSitesConfig";
const allChildSites = reusableFunctions.readJsonFile("testData/childSites", childSitesFileName);
logger.info(`Loading child sites from: ${childSitesFileName}`);

// Get BASE_URL from config for filtering by parent URL
const BASE_URL = config.get("Environment").baseURL;

// Filter by parentUrl to get sites belonging to current environment
let testData = allChildSites.filter((site) => site.parentUrl === BASE_URL);
logger.info(`Filtered by parentUrl: ${BASE_URL}`);

// Additionally filter by createSiteInThisRun if ONLY_NEW=true
if (process.env.ONLY_NEW === "true") {
  testData = testData.filter((site) => site.createSiteInThisRun === true);
  logger.info(`Additionally filtered by createSiteInThisRun: true`);
}

logger.info(`Total sites to process: ${testData.length}`);

// Shared variables
let jwt;
let parentOrgId;
let peopleSoftId;
let domainUuid;
let allLicensePools = [];
let initialChildCount = 0;
let createdChildSitesCount = 0;

// Serial execution: All steps run in order (setup → create → verify)
test.describe("Create Child Sites - Full Flow", () => {
  test.describe.configure({ mode: "serial" }); // Ensures sequential execution

  // Run once before all tests: Generate JWT and get parent org ID
  test.beforeAll("Generate JWT and fetch org config", async ({ request }) => {
    // Generate authentication token for API calls
    jwt = await generateTokenWithOrgId(request);

    // Get parent organization ID from config
    parentOrgId = config.get("Environment").orgId;
    logger.info(`Parent Org ID: ${parentOrgId}`);
  });

  // Step 1: Fetch required data (must complete before creating child sites)
  test.describe("Setup: Fetch Required Data", () => {
    // Ensure admin user exists in parent org (required for child site creation)
    test("Ensure admin user exists in parent org", async ({ request }) => {
      try {
        // Get admin details from first test data entry (all entries use same admin)
        const adminEmail = testData[0].admin.email;
        const adminFirstName = testData[0].admin.firstName;
        const adminLastName = testData[0].admin.lastName;

        logger.info(`Checking if admin user exists: ${adminEmail}`);

        // Fetch all users and search for admin by email
        const usersResponse = await getAllUserApi(request, jwt, adminEmail);
        const adminUser = usersResponse?.users?.find(
          (user) => user.email?.toLowerCase() === adminEmail.toLowerCase()
        );

        if (adminUser) {
          logger.info(
            `✅ Admin user already exists: ${adminFirstName} ${adminLastName} (${adminEmail})`
          );
        } else {
          // Admin not found - create the user using reusable function
          logger.info(
            `Admin user not found. Creating: ${adminFirstName} ${adminLastName}`
          );

          const result = await reusableFunctions.createSingleUser(
            request,
            jwt,
            {
              email: adminEmail,
              firstName: adminFirstName,
              lastName: adminLastName,
              role: "ADMIN",
              jobTitle: "Site Administrator",
            }
          );

          expect(result.success).toBe(true);
        }
      } catch (error) {
        logger.error(`Failed to ensure admin user exists: ${error.message}`);
        throw error;
      }
    });

    // Get current count of child sites (for verification later)
    test("Fetch initial multi-sites hierarchy", async ({ request }) => {
      try {
        // Fetch the current organization hierarchy
        const result = await getMultiSitesHierarchyApi(request, jwt, false);
        expect(result.success).toBe(true);

        // Count existing child sites
        if (result.hierarchy.length > 0 && result.hierarchy[0].children) {
          initialChildCount = result.hierarchy[0].children.length;
        }

        logger.info(`Initial child sites count: ${initialChildCount}`);
      } catch (error) {
        logger.error(`Failed to fetch initial hierarchy: ${error.message}`);
        throw error;
      }
    });

    // Get parent org details (needed for child site creation)
    test("Fetch parent organization details", async ({ request }) => {
      try {
        // Fetch parent organization information
        const result = await getOrganizationDetailsApi(
          request,
          jwt,
          parentOrgId
        );

        // Store required IDs for child site creation
        peopleSoftId = result.peopleSoftId;
        domainUuid = result.domainUuid;
      } catch (error) {
        logger.error(`Failed to fetch organization details: ${error.message}`);
        throw error;
      }
    });

    // Get all license pools (each child site will get all available pools)
    test("Fetch all license pools from parent org", async ({ request }) => {
      try {
        // Fetch all license pools from parent organization
        const response =
          await apiresponseValidations.getLicencePoolOfOrganisation(
            request,
            urlData.getAllLicencePoolsUrl,
            jwt
          );
        expect(response.status()).toBe(200);

        // Store all license pools
        allLicensePools = await response.json();

        // Ensure we have license pools to assign
        if (allLicensePools.length === 0) {
          logger.error("No license pools found in parent org");
          throw new Error("Cannot create child sites without license pools");
        }

        // Log available license pools
        logger.info(
          `Found ${allLicensePools.length} license pools in parent org`
        );
        allLicensePools.forEach((pool) => {
          const availableSeats =
            pool.boughtLicenseCount - pool.consumedLicenseCount;
          logger.info(
            `  - ${pool.name} (ID: ${pool.id}, Available Seats: ${availableSeats})`
          );
        });
      } catch (error) {
        logger.error(`Failed to fetch license pools: ${error.message}`);
        throw error;
      }
    });
  });

  // Step 2: Create all child sites in parallel (after fetching required data)
  test("Create all child sites in parallel", async ({ request }) => {
    test.setTimeout(300000); // 5 minutes so a 50-site batch can finish

    // Skip if no license pools are available
    test.skip(
      !allLicensePools || allLicensePools.length === 0,
      "Skipping child site creation as license pools not available"
    );

    logger.info(`🚀 Creating ${testData.length} child sites in parallel...`);

    // Create array of promises - one for each child site (runs in parallel)
    const childSiteCreationPromises = testData.map(async (siteData) => {
      // Create child site with all required details
      const result = await createChildSiteApi(
        request,
        jwt,
        siteData,
        parentOrgId,
        peopleSoftId,
        domainUuid,
        allLicensePools,
        siteData.seatsPerPool
      );

      // Validate child site was created successfully
      expect(result.success).toBe(true);
      expect(result.orgId).toBeDefined();

      // Log created child site details
      logger.info(
        `✅ Child site created: ${siteData.domain} with Org ID: ${result.orgId}`
      );
      logger.info(`   Domain: ${result.domain}`);
      logger.info(`   Admin Email: ${result.adminEmail}`);
      logger.info(
        `   License Pools: ${result.licensePoolCount} pools assigned with ${siteData.seatsPerPool} seats each`
      );

      return result;
    });

    // Wait for ALL child sites to complete (continues even if some fail)
    const results = await Promise.allSettled(childSiteCreationPromises);

    // Count successes and failures
    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    createdChildSitesCount = successes.length;

    // Log summary
    logger.info(`\n📊 Child Site Creation Summary:`);
    logger.info(`   ✅ Successful: ${successes.length}`);
    logger.info(`   ❌ Failed: ${failures.length}`);

    // Log failed sites
    if (failures.length > 0) {
      failures.forEach((f, i) => {
        logger.error(`   Failed site ${i + 1}: ${f.reason.message}`);
      });
    }

    // Fail test only if ALL failed, otherwise continue with partial success
    expect(successes.length).toBeGreaterThan(0);
  });

  // Step 3: Verify child sites were created successfully
  test("Verify final child sites count increased", async ({ request }) => {
    try {
      // Fetch updated hierarchy to count child sites
      const result = await getMultiSitesHierarchyApi(request, jwt, false);
      expect(result.success).toBe(true);

      // Count final number of child sites
      let finalChildCount = 0;
      if (result.hierarchy.length > 0 && result.hierarchy[0].children) {
        finalChildCount = result.hierarchy[0].children.length;
      }

      // Calculate expected count (initial + newly created)
      const expectedChildCount = initialChildCount + createdChildSitesCount;

      // Log verification details
      logger.info(`\n📊 Child Sites Verification:`);
      logger.info(`   Initial child sites: ${initialChildCount}`);
      logger.info(`   Created child sites: ${createdChildSitesCount}`);
      logger.info(`   Expected final count: ${expectedChildCount}`);
      logger.info(`   Actual final count: ${finalChildCount}`);

      // Verify count matches expected
      expect(finalChildCount).toBe(expectedChildCount);
      logger.info(
        `✅ Verification passed: Child sites count increased correctly!`
      );
    } catch (error) {
      logger.error(`Failed to verify child sites count: ${error.message}`);
      throw error;
    }
  });
});
