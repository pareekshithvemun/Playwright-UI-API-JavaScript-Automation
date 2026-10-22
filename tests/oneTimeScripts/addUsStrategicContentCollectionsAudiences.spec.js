/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Creates one audience per Content Collections value. Audience name is that value.
 * Uses the same createAudiencePayload as createAudienceandAddAdmin / prevalChildSitesSetup.
 * Site URLs, org ids, and login come from FileName JSON only — not from config.
 *
 * Default: first site only. After check, run the rest with SITE_NAME=all.
 * Run: npm run addUsStrategicContentCollectionsAudiences
 * Optional: FileName=usStrategicSiteAdmins (default)
 */
import {
  test,
  expect,
  logger,
  reusableFunctions,
  headerData,
  tokenGeneratorWithOrgIdPayload,
  searchUserBody,
  createAudiencePayload,
  getAllAudience,
  apiresponseValidations,
} from "../../path.js";

const fileName = (process.env.FileName || "usStrategicSiteAdmins").trim();
const testData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);
const callerLogin = String(testData.callerLogin || "").trim();
const password = String(testData.password || "").trim();
const attributeName = String(
  testData.contentCollectionsAttribute?.attributeName || "",
).trim();
const attributeValues =
  testData.contentCollectionsAttribute?.attributeValues || [];
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

// Login is an email; match any of the three UCM identity fields.
function userEmailFieldsMatch(user, searchLower) {
  let email = String(user.email || "")
    .trim()
    .toLowerCase();
  let loginName = String(user.loginName || "")
    .trim()
    .toLowerCase();
  let externalId = String(user.externalId || "")
    .trim()
    .toLowerCase();
  return (
    email === searchLower ||
    loginName === searchLower ||
    externalId === searchLower
  );
}

async function findUserOnSite(request, siteUrl, token, email) {
  let searchLower = email.toLowerCase();
  let res = await request.post(`${siteUrl}/api/ucm/users`, {
    data: searchUserBody(email),
    headers: headerData.getAllUsersHeaders(token, "application/json"),
  });
  if (res.status() !== 200) {
    logger.error(`User search failed on ${siteUrl} for ${email}`);
    return null;
  }
  let body = await res.json();
  let users = body.users || [];
  for (let user of users) {
    if (userEmailFieldsMatch(user, searchLower)) {
      return user;
    }
  }
  return null;
}

async function findAttributeOnSite(request, siteUrl, token, name) {
  let res = await request.get(`${siteUrl}/api/ucm/custom-attributes/count`, {
    headers: headerData.getAllAttributesHeaders(token),
  });
  if (res.status() !== 200) {
    logger.error(`Could not read attributes on ${siteUrl}`);
    return null;
  }
  let body = await res.json();
  let attributes = body.attributes || [];
  return attributes.find((item) => item.name === name) || null;
}

// Same value list createAudienceandAddAdmin reads before createAudiencePayload.
async function listAttributeValuesOnSite(
  request,
  siteUrl,
  token,
  attributeUuid,
) {
  let response = await apiresponseValidations.getValuesofListAttribute(
    request,
    `${siteUrl}/api/ucm/custom-attributes/values/${attributeUuid}`,
    token,
  );
  if (response.status() !== 200) {
    logger.error(`Could not read attribute values on ${siteUrl}`);
    return [];
  }
  let values = await response.json();
  return Array.isArray(values) ? values : [];
}

async function findAudienceOnSite(request, siteUrl, token, audienceName) {
  let res = await request.post(
    `${siteUrl}/api/ucm/audiences/audience-list-page`,
    {
      data: getAllAudience(),
      headers: headerData.getAllAudienceHeaders(token, "application/json"),
    },
  );
  if (res.status() !== 200) {
    logger.error(`Could not read audiences on ${siteUrl}`);
    return null;
  }
  let body = await res.json();
  let audiences = body.audiences || [];
  return (
    audiences.find((item) => item.audienceName === audienceName) || null
  );
}

// Same create body as createAudienceandAddAdmin: filter on one list value.
async function createAudienceOnSite(
  request,
  siteUrl,
  token,
  audienceName,
  attributeUuid,
  valueUuid,
  ownerIds,
) {
  let res = await request.post(`${siteUrl}/api/ucm/audiences`, {
    data: createAudiencePayload(
      audienceName,
      attributeUuid,
      [valueUuid],
      ownerIds,
    ),
    headers: headerData.audienceCreateapiHeaders(token, "application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Create audience failed on ${siteUrl} for ${audienceName} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Created audience ${audienceName} on ${siteUrl}`);
  return true;
}

function valueUuidForName(attributeValueRows, valueName) {
  let match = attributeValueRows.find(
    (item) => String(item.value || "").trim() === valueName,
  );
  return match?.id || null;
}

test.describe.serial("US Strategic Content Collections audiences", () => {
  test("Create one audience per Content Collections value", async ({
    request,
  }) => {
    test.setTimeout(600000);
    expect(callerLogin).toBeTruthy();
    expect(password).toBeTruthy();
    expect(attributeName).toBeTruthy();
    expect(attributeValues.length).toBeGreaterThan(0);

    let selectedSites = sitesToRun();
    expect(selectedSites.length).toBeGreaterThan(0);

    let createdCount = 0;
    let alreadyThereCount = 0;
    let failedCount = 0;

    for (let site of selectedSites) {
      let siteUrl = normalizeSiteUrl(site.siteUrl);
      let organizationId = String(site.organizationId || "").trim();
      logger.info(`Starting ${site.siteName} (${siteUrl})`);

      if (!organizationId) {
        logger.error(`No organization id in data for ${site.siteName}`);
        failedCount += attributeValues.length;
        continue;
      }

      let token = await authenticateOnSite(
        request,
        siteUrl,
        callerLogin,
        organizationId,
      );
      if (!token) {
        failedCount += attributeValues.length;
        continue;
      }

      let attribute = await findAttributeOnSite(
        request,
        siteUrl,
        token,
        attributeName,
      );
      let attributeUuid = attribute?.customAttributeUuid;
      if (!attributeUuid) {
        logger.error(`${attributeName} was not found on ${siteUrl}`);
        failedCount += attributeValues.length;
        continue;
      }

      let attributeValueRows = await listAttributeValuesOnSite(
        request,
        siteUrl,
        token,
        attributeUuid,
      );
      let caller = await findUserOnSite(
        request,
        siteUrl,
        token,
        callerLogin,
      );
      if (!caller?.id) {
        logger.error(`Could not find ${callerLogin} on ${siteUrl} to own audiences`);
        failedCount += attributeValues.length;
        continue;
      }
      let ownerIds = [caller.id];

      for (let valueName of attributeValues) {
        let existing = await findAudienceOnSite(
          request,
          siteUrl,
          token,
          valueName,
        );
        if (existing) {
          logger.info(`Audience ${valueName} already exists on ${siteUrl}`);
          alreadyThereCount += 1;
          continue;
        }

        let valueUuid = valueUuidForName(attributeValueRows, valueName);
        if (!valueUuid) {
          logger.error(
            `Attribute value ${valueName} was not found on ${siteUrl}`,
          );
          failedCount += 1;
          continue;
        }

        let didCreate = await createAudienceOnSite(
          request,
          siteUrl,
          token,
          valueName,
          attributeUuid,
          valueUuid,
          ownerIds,
        );
        if (didCreate) {
          createdCount += 1;
        } else {
          failedCount += 1;
        }
      }
    }

    logger.info(
      `Content Collections audiences done. Created ${createdCount}. Already there ${alreadyThereCount}. Failed ${failedCount}.`,
    );
    expect(failedCount).toBe(0);
  });
});
