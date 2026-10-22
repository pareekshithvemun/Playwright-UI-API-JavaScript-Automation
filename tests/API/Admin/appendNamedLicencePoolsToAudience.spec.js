import {
  headerData,
  urlData,
  addlicencePoolApipayload,
  expect,
  test,
  generateToken,
  apiresponseValidations,
  getLicensePoolSetRules,
  getAllAudienceApi,
  logger,
  reusableFunctions,
} from "../../../path.js";

let jwt;
const audienceName = process.env.AUDIENCE_NAME?.trim();
const fileName = process.env.FileName || "appendNamedLicencePoolsToAudience";
const dataPath = reusableFunctions.getPath(
  "testData/LicencePool",
  `${fileName}.json`,
);
const testData = reusableFunctions.readDatafromJsonFilenotasync(dataPath);
const poolNames = testData.licensePoolNames || [];

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Append named licence pools to audience", async ({ request }) => {
  if (!audienceName || poolNames.length === 0) {
    test.skip(
      true,
      "Set AUDIENCE_NAME; pool names come from testData/LicencePool/<FileName>.json (default appendNamedLicencePoolsToAudience)",
    );
    return;
  }

  let poolsResponse = await apiresponseValidations.getLicencePoolOfOrganisation(
    request,
    urlData.getAllLicencePoolsUrl,
    jwt,
  );
  expect(poolsResponse.status()).toBe(200);
  let poolsInOrg = await poolsResponse.json();

  let audienceUuid = await getAllAudienceApi(audienceName, request, jwt);
  if (!audienceUuid) {
    test.skip(
      true,
      `Audience "${audienceName}" not found in org; licence pool mapping skipped.`,
    );
    return;
  }

  // Load every page of license-pool-set-rules (API uses max + offset).
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

  for (let poolName of poolNames) {
    let poolRow = poolsInOrg.find((p) => p.name === poolName);
    if (!poolRow) {
      logger.info(`Licence pool not in org: ${poolName}`);
      continue;
    }

    let hasActiveRule = allRules.some(
      (row) =>
        row.audienceId === audienceUuid &&
        row.licensePoolSetId === poolRow.id &&
        row.status === "active",
    );
    if (hasActiveRule) {
      logger.info(`Already mapped (active): ${poolName}`);
      continue;
    }

    try {
      let res = await request.post(urlData.addlicencePoolUrl, {
        data: addlicencePoolApipayload(audienceUuid, poolRow.id),
        headers: headerData.addlicencePoolHeaders(jwt, "application/json"),
      });
      expect(res.status()).toBe(200);
      logger.info(`Mapped ${poolName} to audience ${audienceName}`);
    } catch (error) {
      logger.info(
        `Could not map ${poolName}: ${error}, may already exist or API error`,
      );
    }
  }
});
