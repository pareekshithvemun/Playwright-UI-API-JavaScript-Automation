import {
  headerData,
  urlData,
  addlicencePoolApipayload,
  expect,
  test,
  generateToken,
  apiresponseValidations,
  reusableFunctions,
  getAllAudienceApi,
  logger,
} from "../../../path.js";

let jwt;
let res;
let licencepoolData;
let licencePoolsActuallyInOrg, nameAndIdOfLicencePool;
let missingIds = [];
let additionalIds = [];

/** Set when running: AUDIENCE_NAME=Region npm run checkLicencepoolsAndAppendToAudienceForChildSite */
const audienceNameFromEnv = process.env.AUDIENCE_NAME?.trim();
const bulkFileName =
  process.env.LICENCE_POOL_BULK_FILE || "checkAndAppendLicencePoolsToAudience";
const licencePoolBulkPath = reusableFunctions.getPath(
  "testData/LicencePool",
  `${bulkFileName}.json`,
);
const licencePoolBulkData =
  reusableFunctions.readDatafromJsonFilenotasync(licencePoolBulkPath);
const expectedPoolNamesForGate =
  licencePoolBulkData.expectedPoolNamesInOrg ?? [];

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Get All licencePool of Organisation", async ({ request }) => {
  try {
    let response = await apiresponseValidations.getLicencePoolOfOrganisation(
      request,
      urlData.getAllLicencePoolsUrl,
      jwt
    );
    expect(response.status()).toBe(200);
    res = await response.json();
    licencepoolData = await reusableFunctions.countIdsInLicencePoolandPrint(
      res
    );
    licencePoolsActuallyInOrg = licencepoolData.ids;
    nameAndIdOfLicencePool = licencepoolData.nameAndID;
    logger.info(nameAndIdOfLicencePool);
    if (licencepoolData.countOfLicencePool == 0) {
      logger.info(`No licence pool for this Org`);
    } else {
      logger.info(`It has ${licencepoolData.countOfLicencePool} licencepools`);
    }
  } catch (error) {
    logger.info(`Org may not have licencepool:${error}`);
    test.fail(error);
  }
});

test("Compare licencepools from Test Org", async () => {
  missingIds = [];
  additionalIds = [];
  let licencePoolsInTestDemoPercipioOrg = expectedPoolNamesForGate;
  licencePoolsInTestDemoPercipioOrg.forEach((name) => {
    const matchingItem = nameAndIdOfLicencePool.find(
      (item) => item.Name === name
    );
    if (!matchingItem) {
      missingIds.push(name);
    }
  });

  // Check for additional IDs
  nameAndIdOfLicencePool.forEach((item) => {
    if (!licencePoolsInTestDemoPercipioOrg.includes(item.Name)) {
      additionalIds.push(item);
    }
  });

  logger.info("Missing IDs:");
  logger.info(missingIds);
  logger.info("Additional IDs:");
  logger.info(additionalIds);
});

test("Add LicencePool To Audience", async ({ request }, testInfo) => {
  testInfo.setTimeout(20000);
  if (!audienceNameFromEnv) {
    test.skip(
      true,
      "Set AUDIENCE_NAME (e.g. AUDIENCE_NAME=Region npm run checkLicencepoolsAndAppendToAudienceForChildSite)",
    );
  }
  if (missingIds.length === 0) {
    let audienceUUID = await getAllAudienceApi(
      audienceNameFromEnv,
      request,
      jwt,
    );
    if (!audienceUUID) {
      test.skip(
        true,
        `Audience "${audienceNameFromEnv}" not found in org; licence pool mapping skipped.`,
      );
      return;
    }
    //map all licepool to Region audid
    for (let licencePoolID of licencePoolsActuallyInOrg) {
      try {
        let res = await request.post(urlData.addlicencePoolUrl, {
          data: addlicencePoolApipayload(audienceUUID, licencePoolID),
          headers: headerData.addlicencePoolHeaders(jwt, "application/json"),
        });
        expect(res.status()).toBe(200);
        logger.info(
          `Added licencePoolID:${licencePoolID} to audience :${audienceUUID}`
        );
      } catch (error) {
        logger.info(
          `Tried to add licencePoolID:${licencePoolID} to audience :${audienceUUID} but failed, may be it has been already appended or licencepool not there in org`
        );
      }
    }
  } else {
    logger.info(
      `Some licencePools  missing in this org shown below. please add those to org and then rerun the same command`
    );
    logger.info(missingIds);
  }
});
