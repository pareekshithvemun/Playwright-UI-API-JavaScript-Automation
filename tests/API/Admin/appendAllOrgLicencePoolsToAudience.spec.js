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

/** Set when running: AUDIENCE_NAME=Region npm run appendAllOrgLicencePoolsToAudience */
const audienceNameFromEnv = process.env.AUDIENCE_NAME?.trim();

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe.serial("Append all org licence pools to audience (no compare gate)", () => {
  test("Get all licence pools and map each to audience", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(40000);
    if (!audienceNameFromEnv) {
      test.skip(
        true,
        "Set AUDIENCE_NAME (e.g. AUDIENCE_NAME=Region npm run appendAllOrgLicencePoolsToAudience)",
      );
      return;
    }

    let response = await apiresponseValidations.getLicencePoolOfOrganisation(
      request,
      urlData.getAllLicencePoolsUrl,
      jwt,
    );
    expect(response.status()).toBe(200);
    const res = await response.json();
    const licencepoolData = await reusableFunctions.countIdsInLicencePoolandPrint(
      res,
    );
    const licencePoolsActuallyInOrg = licencepoolData.ids;

    if (licencepoolData.countOfLicencePool === 0) {
      logger.info("No licence pools in this org; nothing to append.");
      return;
    }

    logger.info(
      `Mapping ${licencepoolData.countOfLicencePool} licence pool(s) to audience "${audienceNameFromEnv}" (no expected-pool compare).`,
    );

    const audienceUUID = await getAllAudienceApi(
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

    for (const licencePoolID of licencePoolsActuallyInOrg) {
      try {
        const addRes = await request.post(urlData.addlicencePoolUrl, {
          data: addlicencePoolApipayload(audienceUUID, licencePoolID),
          headers: headerData.addlicencePoolHeaders(jwt, "application/json"),
        });
        expect(addRes.status()).toBe(200);
        logger.info(
          `Added licencePoolID:${licencePoolID} to audience ${audienceUUID}`,
        );
      } catch (error) {
        logger.info(
          `Tried to add licencePoolID:${licencePoolID} to audience ${audienceUUID} but failed; may already be linked or not applicable: ${error?.message ?? error}`,
        );
      }
    }
  });
});
