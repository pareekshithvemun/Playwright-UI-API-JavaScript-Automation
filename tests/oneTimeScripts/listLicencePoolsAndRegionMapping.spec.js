/**
 * ONE-TIME / read-only — lists license pools in the org and which are mapped to Region.
 * Does not create or update license-pool-set-rules.
 *
 * Run: NODE_ENV=<config> npx playwright test tests/oneTimeScripts/listLicencePoolsAndRegionMapping.spec.js
 * Optional: AUDIENCE_NAME=Region (default)
 */
import {
  test,
  expect,
  generateToken,
  apiresponseValidations,
  getLicensePoolSetRules,
  getAllAudienceApi,
  urlData,
  logger,
} from "../../path.js";

const audienceName = (process.env.AUDIENCE_NAME || "Region").trim();

let jwt;

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("List org licence pools and Region audience mappings", async ({
  request,
}) => {
  let poolsResponse = await apiresponseValidations.getLicencePoolOfOrganisation(
    request,
    urlData.getAllLicencePoolsUrl,
    jwt,
  );
  expect(poolsResponse.status()).toBe(200);
  let poolsInOrg = await poolsResponse.json();
  if (!Array.isArray(poolsInOrg)) {
    poolsInOrg = [];
  }

  logger.info(`Org licence pools (${poolsInOrg.length}):`);
  for (let pool of poolsInOrg) {
    logger.info(
      `  - ${pool.name}${pool.code ? ` [${pool.code}]` : ""} (id: ${pool.id})`,
    );
  }

  let audienceUuid = await getAllAudienceApi(audienceName, request, jwt);
  if (!audienceUuid) {
    logger.error(`Audience "${audienceName}" not found.`);
    return;
  }
  logger.info(`Audience "${audienceName}" uuid: ${audienceUuid}`);

  let allRules = [];
  const pageSize = 50;
  let offset = 0;
  let keepFetching = true;
  while (keepFetching) {
    const rulesUrl = `${urlData.getLicensePoolSetRulesUrl}?max=${pageSize}&offset=${offset}`;
    const rulesRes = await getLicensePoolSetRules(request, rulesUrl, jwt);
    expect(rulesRes.status()).toBe(200);
    const batch = await rulesRes.json();
    if (!batch?.length) {
      keepFetching = false;
    } else {
      allRules.push(...batch);
      if (batch.length < pageSize) {
        keepFetching = false;
      } else {
        offset += pageSize;
      }
    }
  }

  let poolById = new Map(poolsInOrg.map((pool) => [pool.id, pool]));
  let activeMapped = allRules.filter(
    (row) => row.audienceId === audienceUuid && row.status === "active",
  );

  logger.info(
    `Active licence pools mapped to "${audienceName}" (${activeMapped.length}):`,
  );
  for (let rule of activeMapped) {
    let pool = poolById.get(rule.licensePoolSetId);
    let poolLabel = pool
      ? `${pool.name}${pool.code ? ` [${pool.code}]` : ""}`
      : `(unknown pool id ${rule.licensePoolSetId})`;
    logger.info(`  - ${poolLabel}`);
  }

  let mappedIds = new Set(activeMapped.map((row) => row.licensePoolSetId));
  let notMapped = poolsInOrg.filter((pool) => !mappedIds.has(pool.id));
  logger.info(
    `Org pools NOT actively mapped to "${audienceName}" (${notMapped.length}):`,
  );
  for (let pool of notMapped) {
    logger.info(
      `  - ${pool.name}${pool.code ? ` [${pool.code}]` : ""}`,
    );
  }
});
