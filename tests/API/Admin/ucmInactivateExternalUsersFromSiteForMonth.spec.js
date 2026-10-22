import {
  test,
  expect,
  generateToken,
  logger,
  reusableFunctions,
  path,
  fs,
  exportAllUsersCsvToFile,
  loadUsersFromExportCsv,
  getFilteredSortedUsersFromExport,
  putUserInactiveByExternalId,
} from "../../../path.js";

/**
 * ucmInactivateExternalUsersFromSiteForMonth — export all users CSV, filter external learners by month, inactivate.
 *
 * Spec: tests/API/Admin/ucmInactivateExternalUsersFromSiteForMonth.spec.js
 * npm (one org):     USERS_EXPORT_MONTH=6 NODE_ENV=contenteval npm run ucmInactivateExternalUsersFromSiteForMonth
 * npm (monthly cron): npm run ucmInactivateExternalUsersMonthlyCron
 *   → reads testData/orgsData/monthlyExternalUserSites.json
 *   → writes config/runtimeOrg.json per site (shared admin + that site URL/orgId)
 *   → sets USERS_EXPORT_MONTH/YEAR = IST today minus 2 months
 *   → runs this spec with NODE_ENV=runtimeOrg for each site
 *
 * --- MANDATORY (must pass on command line or test fails) ---
 * USERS_EXPORT_MONTH   Month for "Date Created" filter. Examples: 3, 03, mar, march
 *                      Error if missing: "Please pass month — set USERS_EXPORT_MONTH ..."
 *
 * --- OPTIONAL (defaults used if omitted) ---
 * NODE_ENV             Config org (config/*.json). Monthly cron uses runtimeOrg.
 * USERS_EXPORT_YEAR    Date Created year. Default: 2026
 * USERS_EXPORT_MAX_RETRIES   Status API polls before fail. Default: 10
 * USERS_EXPORT_POLL_MS       Wait between status polls (ms). Default: 2500
 *
 * --- SET BY CONFIG (not env vars) ---
 * Admin login/password   config → Admindata (from NODE_ENV file)
 * baseURL / org          config → Environment.baseURL, Environment.orgId
 *
 * --- FILTERS APPLIED (readUsersExportCsv.js) ---
 * status = active | role = Learner | Date Created = year+month | email not ending @skillsoft.com (blank email included)
 *
 * --- OUTPUT ---
 * CSV:  test-results/downloads/<org>-users-export-<jobId>.csv
 * Logs: filtered user rows (all CSV columns) via logger.info
 * Then: putUserInactiveByExternalId per row (POST search by externalUserId → PUT inactive)
 *
 * --- ONE-ORG LOCAL EXAMPLE ---
 * NODE_ENV=contenteval USERS_EXPORT_YEAR=2026 USERS_EXPORT_MONTH=6 \
 *   npm run ucmInactivateExternalUsersFromSiteForMonth
 *
 * --- ADD A SITE TO MONTHLY CRON ---
 * Add one row (name, baseURL, orgId) in testData/orgsData/monthlyExternalUserSites.json
 */

const SAVE_DIR = path.join(process.cwd(), "test-results", "downloads");

let jwt;
let filteredUsersFromExport = [];

test.beforeAll(async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe("Inactivate external users from site for month @ucmInactivateExternalUsersFromSiteForMonth", () => {
  test("download export, filter users, inactivate each via externalUserId", async ({
    request,
  }) => {
    test.setTimeout(3600000);

    fs.mkdirSync(SAVE_DIR, { recursive: true });
    const orgLabel = reusableFunctions.orgHostname();

    const { savePath } = await exportAllUsersCsvToFile(
      request,
      jwt,
      SAVE_DIR,
      orgLabel,
    );
    const allUsers = loadUsersFromExportCsv(savePath);
    expect(allUsers.length).toBeGreaterThan(0);

    filteredUsersFromExport = getFilteredSortedUsersFromExport(allUsers);
    logger.info(
      `[${orgLabel}] file: ${savePath} | all: ${allUsers.length} | after filters: ${filteredUsersFromExport.length}`,
    );
    if (filteredUsersFromExport.length === 0) {
      logger.info(`[${orgLabel}] no users match filters — skipping inactivate`);
      return;
    }

    for (const exportUser of filteredUsersFromExport) {
      const externalId = exportUser.externalUserId?.trim();
      if (!externalId) {
        logger.warn(
          `[${orgLabel}] deactivate SKIP — no externalUserId on export row`,
        );
        continue;
      }
      try {
        await putUserInactiveByExternalId(request, jwt, externalId);
      } catch (error) {
        logger.error(
          `[${orgLabel}] deactivate FAIL | externalId=${externalId} | ${error.message}`,
        );
      }
    }

    logger.info(
      `[${orgLabel}] inactivate loop finished for ${filteredUsersFromExport.length} filtered users (see deactivate OK/SKIP lines above)`,
    );
  });
});
