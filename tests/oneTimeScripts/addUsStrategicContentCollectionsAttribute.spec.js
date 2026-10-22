/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Creates the Content Collections list attribute on each US Strategic child site
 * from FileName JSON. Uses the same create-attribute payloads as listAttributeCreation.
 * Site URLs, org ids, and login come from that JSON only — not from config.
 *
 * Run: npm run addUsStrategicContentCollectionsAttribute
 * Optional: FileName=usStrategicSiteAdmins (default)
 */
import {
  test,
  expect,
  logger,
  reusableFunctions,
  headerData,
  tokenGeneratorWithOrgIdPayload,
  createAttributePayload,
  addAttributeValuesBody,
} from "../../path.js";

const fileName = (process.env.FileName || "usStrategicSiteAdmins").trim();
const testData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);
const callerLogin = String(testData.callerLogin || "").trim();
const password = String(testData.password || "").trim();
const sites = testData.sites || [];
const attributeName = String(
  testData.contentCollectionsAttribute?.attributeName || "",
).trim();
const attributeValues = testData.contentCollectionsAttribute?.attributeValues || [];

// ===================== Helper Functions =====================

// Sheet URLs often end with /; API paths must not double the slash.
function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || "")
    .trim()
    .replace(/\/+$/, "");
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

// Same lookup listAttributeCreation uses before it creates a list attribute.
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

// Same create body as listAttributeCreation: list type (VALUE) with multiple values.
async function createListAttributeOnSite(request, siteUrl, token, name) {
  let res = await request.post(`${siteUrl}/api/ucm/custom-attributes`, {
    data: createAttributePayload(name, true, "VALUE", true),
    headers: headerData.attributeCreateapiHeaders(token, "application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Create attribute failed on ${siteUrl} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return null;
  }
  let body = await res.json();
  logger.info(`Created list attribute ${name} on ${siteUrl}`);
  return body.customAttributeUuid;
}

// Same value PUT as listAttributeCreation after the attribute exists.
async function addListValuesOnSite(
  request,
  siteUrl,
  token,
  attributeUuid,
  name,
  values,
) {
  let res = await request.put(
    `${siteUrl}/api/ucm/custom-attributes/${attributeUuid}`,
    {
      data: addAttributeValuesBody(name, values),
      headers: headerData.addAttributeValuetoAttributes(
        token,
        "application/json",
      ),
    },
  );
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Add attribute values failed on ${siteUrl} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Added list values to ${name} on ${siteUrl}`);
  return true;
}

test.describe.serial("US Strategic Content Collections attribute", () => {
  test("Create Content Collections list attribute on each child site", async ({
    request,
  }) => {
    test.setTimeout(600000);
    expect(callerLogin).toBeTruthy();
    expect(password).toBeTruthy();
    expect(attributeName).toBeTruthy();
    expect(attributeValues.length).toBeGreaterThan(0);
    expect(sites.length).toBeGreaterThan(0);

    let createdCount = 0;
    let alreadyThereCount = 0;
    let failedCount = 0;

    for (let site of sites) {
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

      let existing = await findAttributeOnSite(
        request,
        siteUrl,
        token,
        attributeName,
      );
      let attributeUuid = existing?.customAttributeUuid;
      if (attributeUuid) {
        logger.info(`${attributeName} already exists on ${siteUrl}`);
      } else {
        attributeUuid = await createListAttributeOnSite(
          request,
          siteUrl,
          token,
          attributeName,
        );
        if (!attributeUuid) {
          failedCount += 1;
          continue;
        }
      }

      let didAddValues = await addListValuesOnSite(
        request,
        siteUrl,
        token,
        attributeUuid,
        attributeName,
        attributeValues,
      );
      if (!didAddValues) {
        failedCount += 1;
        continue;
      }

      if (existing) {
        alreadyThereCount += 1;
      } else {
        createdCount += 1;
      }
    }

    logger.info(
      `Content Collections done. Created ${createdCount}. Already there ${alreadyThereCount}. Failed ${failedCount}.`,
    );
    expect(failedCount).toBe(0);
  });
});
