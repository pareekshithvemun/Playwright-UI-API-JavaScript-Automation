/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Fetches every license pool in the org, then maps each pool to one audience
 * whose name matches that pool (1 to 1).
 * Uses addlicencePoolApipayload plus the org pool list and set-rules APIs
 * from appendNamedLicencePoolsToAudience.
 * Site URLs, org ids, and login come from FileName JSON only — not from config.
 *
 * Default: first site only. After check, run the rest with SITE_NAME=all.
 * Run: npm run addUsStrategicContentCollectionsLicencePools
 * Optional: FileName=usStrategicSiteAdmins (default)
 */
import {
  test,
  expect,
  logger,
  reusableFunctions,
  headerData,
  tokenGeneratorWithOrgIdPayload,
  addlicencePoolApipayload,
  getAllAudience,
  getLicensePoolSetRules,
  apiresponseValidations,
} from "../../path.js";

const fileName = (process.env.FileName || "usStrategicSiteAdmins").trim();
const testData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);
const callerLogin = String(testData.callerLogin || "").trim();
const password = String(testData.password || "").trim();
const allSites = testData.sites || [];

// ===================== Helper Functions =====================

// Sheet URLs often end with /; API paths must not double the slash.
function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || "")
    .trim()
    .replace(/\/+$/, "");
}

// Default is site 1 only; SITE_NAME=all is for the other six after the check.
function sitesToRun() {
  let siteFilter = String(process.env.SITE_NAME || "").trim();
  if (!siteFilter) {
    return allSites.slice(0, 1);
  }
  if (siteFilter.toLowerCase() === "all") {
    return allSites.slice(1);
  }
  return allSites.filter((site) => {
    let siteName = String(site.siteName || "").toLowerCase();
    let siteUrl = normalizeSiteUrl(site.siteUrl).toLowerCase();
    let filter = siteFilter.toLowerCase();
    return siteName === filter || siteUrl.includes(filter);
  });
}

// Sign in on this site URL with that site's org id so we never pick a host from config.
async function authenticateOnSite(request, siteUrl, login, organizationId) {
  let res = await request.post(`${siteUrl}/api/public/auth/authenticate`, {
    data: tokenGeneratorWithOrgIdPayload(login, password, organizationId),
    headers: headerData.tokenGeneratorApiHeader("application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Could not sign in on ${siteUrl} as ${login} (${res.status()}): ${errorText.slice(0, 300)}`,
    );
    return null;
  }
  let body = await res.json();
  logger.info(`Signed in on ${siteUrl} as ${login}`);
  return body.id_token;
}

async function fetchAudiencesOnSite(request, siteUrl, token) {
  let res = await request.post(
    `${siteUrl}/api/ucm/audiences/audience-list-page`,
    {
      data: getAllAudience(),
      headers: headerData.getAllAudienceHeaders(token, "application/json"),
    },
  );
  if (res.status() !== 200) {
    logger.error(`Could not read audiences on ${siteUrl}`);
    return [];
  }
  let body = await res.json();
  return body.audiences || [];
}

// Pool names can add a type suffix; audience name is the part before " (".
function audienceNameFromPoolName(poolName) {
  let name = String(poolName || "").trim();
  let suffixStart = name.indexOf(" (");
  if (suffixStart > 0) {
    return name.slice(0, suffixStart);
  }
  return name;
}

function audienceForPool(audiences, poolName) {
  let poolLabel = String(poolName || "").trim();
  let shortName = audienceNameFromPoolName(poolLabel);
  return (
    audiences.find((item) => item.audienceName === poolLabel) ||
    audiences.find((item) => item.audienceName === shortName) ||
    null
  );
}

// Same org pool list appendNamedLicencePoolsToAudience uses before it maps.
async function fetchPoolsOnSite(request, siteUrl, token) {
  let response = await apiresponseValidations.getLicencePoolOfOrganisation(
    request,
    `${siteUrl}/api/admin/licenses/license-pool-sets`,
    token,
  );
  if (response.status() !== 200) {
    logger.error(`Could not read license pools on ${siteUrl}`);
    return [];
  }
  let pools = await response.json();
  if (!Array.isArray(pools)) {
    logger.error(`License pool list was not an array on ${siteUrl}`);
    return [];
  }
  let poolNames = pools.map((pool) => String(pool.name || "").trim());
  logger.info(
    `License pools on ${siteUrl}: ${poolNames.join(", ") || "(none)"}`,
  );
  return pools;
}

// Same paged set-rules read so we do not map a pool that is already active.
async function fetchActiveRulesOnSite(request, siteUrl, token) {
  let allRules = [];
  let pageSize = 50;
  let offset = 0;
  let keepFetching = true;
  while (keepFetching) {
    let rulesUrl = `${siteUrl}/api/admin/licenses/license-pool-set-rules?max=${pageSize}&offset=${offset}`;
    let rulesRes = await getLicensePoolSetRules(request, rulesUrl, token);
    if (rulesRes.status() !== 200) {
      logger.error(`Could not read license pool rules on ${siteUrl}`);
      return [];
    }
    let batch = await rulesRes.json();
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
  return allRules;
}

function hasActiveMapping(rules, audienceUuid, poolId) {
  return rules.some(
    (row) =>
      row.audienceId === audienceUuid &&
      row.licensePoolSetId === poolId &&
      row.status === "active",
  );
}

async function mapPoolToAudienceOnSite(
  request,
  siteUrl,
  token,
  audienceUuid,
  poolId,
  poolName,
  audienceName,
) {
  let res = await request.post(
    `${siteUrl}/api/admin/licenses/license-pool-set-rules/create-license`,
    {
      data: addlicencePoolApipayload(audienceUuid, poolId),
      headers: headerData.addlicencePoolHeaders(token, "application/json"),
    },
  );
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Map failed on ${siteUrl} for ${poolName} to ${audienceName} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Mapped license pool ${poolName} to audience ${audienceName}`);
  return true;
}

test.describe.serial("US Strategic Content Collections licence pools", () => {
  test("Map each same-named license pool to its audience", async ({
    request,
  }) => {
    test.setTimeout(600000);
    expect(callerLogin).toBeTruthy();
    expect(password).toBeTruthy();

    let selectedSites = sitesToRun();
    expect(selectedSites.length).toBeGreaterThan(0);

    let mappedCount = 0;
    let alreadyThereCount = 0;
    let failedCount = 0;

    for (let site of selectedSites) {
      let siteUrl = normalizeSiteUrl(site.siteUrl);
      let organizationId = String(site.organizationId || "").trim();
      logger.info(`Starting ${site.siteName} (${siteUrl})`);

      if (!organizationId) {
        logger.error(`No organization id in data for ${site.siteName}`);
        failedCount += 1;
        continue;
      }

      let token = await authenticateOnSite(
        request,
        siteUrl,
        callerLogin,
        organizationId,
      );
      if (!token) {
        failedCount += 1;
        continue;
      }

      let pools = await fetchPoolsOnSite(request, siteUrl, token);
      let audiences = await fetchAudiencesOnSite(request, siteUrl, token);
      let rules = await fetchActiveRulesOnSite(request, siteUrl, token);

      for (let pool of pools) {
        let poolName = String(pool.name || "").trim();
        let audience = audienceForPool(audiences, poolName);
        if (!audience?.audienceUuid) {
          logger.error(
            `No audience matched license pool ${poolName} on ${siteUrl}`,
          );
          failedCount += 1;
          continue;
        }

        if (hasActiveMapping(rules, audience.audienceUuid, pool.id)) {
          logger.info(
            `Already mapped: ${poolName} to ${audience.audienceName}`,
          );
          alreadyThereCount += 1;
          continue;
        }

        let didMap = await mapPoolToAudienceOnSite(
          request,
          siteUrl,
          token,
          audience.audienceUuid,
          pool.id,
          poolName,
          audience.audienceName,
        );
        if (didMap) {
          mappedCount += 1;
        } else {
          failedCount += 1;
        }
      }
    }

    logger.info(
      `Content Collections licence pools done. Mapped ${mappedCount}. Already there ${alreadyThereCount}. Failed ${failedCount}.`,
    );
    expect(failedCount).toBe(0);
  });
});
