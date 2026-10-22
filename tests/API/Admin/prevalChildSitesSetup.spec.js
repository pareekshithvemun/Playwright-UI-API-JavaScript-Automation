import {
  expect,
  test,
  headerData,
  generateToken,
  urlData,
  logger,
  createAudiencePayload,
  orgSettingsApi,
  getAllUserApi,
  getAllAttributesApi,
  getAllAudienceApi,
  apiresponseValidations,
  config,
  addlicencePoolApipayload,
  reusableFunctions,
  updateUserWithCustomAttributesApi,
} from "../../../path.js";

let jwt;
let attributeUUID, attributeValueUUID;
let ownerData = [];
let audienceUUID;
let allUsersResponse; // Store users response to avoid multiple API calls

// Load child sites config and get siteUser data for current environment
const allChildSites = reusableFunctions.readJsonFile(
  "testData/childSites/childSitesConfig.json",
);
const BASE_URL = config.get("Environment").baseURL;

// Extract domain from BASE_URL (e.g., "https://proservicetest.percipio.com" -> "proservicetest")
const currentDomain = BASE_URL.replace("https://", "").split(".")[0];

// Get the matching site by domain to extract siteUser
const currentSite = allChildSites.find((site) => site.domain === currentDomain);
const siteUserData = currentSite?.siteUser;

logger.info(`Current domain: ${currentDomain}`);
if (siteUserData) {
  logger.info(
    `Site user to create: ${siteUserData.firstName} ${siteUserData.lastName} (${siteUserData.email})`,
  );
} else {
  logger.info(`Site user data not found for current domain ${currentDomain}`);
}

// Configuration - modify these values as needed
const CONFIG = {
  audienceName: "evalAudience",
  attributeName: "Entitlements",
  attributeValue: "evalUser",
  regionsForILT: ["US", "UK"],
  customAreaSection: "Skillsoft",
  newUserPassword: config.get("Admindata").password,
};

test.beforeAll("Generate Token and Fetch Users", async ({ request }) => {
  jwt = await generateToken(request);
  allUsersResponse = await getAllUserApi(request, jwt);
  logger.info(`Fetched ${allUsersResponse.users?.length || 0} users`);
});

test.describe("Preval Child Sites Setup", async () => {
  test.describe.configure({ mode: "serial" });

  test("Edit Org Settings", async ({ request }) => {
    let resp = await orgSettingsApi(
      request,
      jwt,
      CONFIG.regionsForILT,
      14,
      70,
      CONFIG.customAreaSection,
    );
    logger.info(
      `Org Settings updated with customAreaSection: ${CONFIG.customAreaSection}`,
    );
  });

  test("Create or Get Attribute", async ({ request }) => {
    // Check if attribute already exists
    try {
      let existingAttr = await getAllAttributesApi(
        request,
        jwt,
        CONFIG.attributeName,
      );
      if (existingAttr && existingAttr.customAttributeUuid) {
        attributeUUID = existingAttr.customAttributeUuid;
        logger.info(`Attribute "${CONFIG.attributeName}" already exists`);
        logger.info(`Attribute UUID: ${attributeUUID}`);
        // Get attribute values
        let response = await apiresponseValidations.getValuesofListAttribute(
          request,
          urlData.getValuesOfListAttriHeadersUrl(attributeUUID),
          jwt,
        );
        let res = await response.json();
        let matchingValue = res.find(
          (item) => item.value === CONFIG.attributeValue,
        );
        attributeValueUUID = matchingValue ? matchingValue.id : res[0]?.id;
        logger.info(`Attribute Value UUID: ${attributeValueUUID}`);
        return;
      }
    } catch (e) {
      logger.info(`Attribute not found, creating new one`);
    }

    // Create new attribute
    let headerOfCreateAttribute = headerData.attributeCreateapiHeaders(
      jwt,
      "application/json",
    );
    const attributePayload = {
      name: CONFIG.attributeName,
      allowImpromptuValueCreation: true,
      typeName: "VALUE",
      optionValues: [CONFIG.attributeValue],
      displayLabel: [{ locale: "en-US", text: CONFIG.attributeName }],
      multipleValuesEnabled: true,
    };

    const res = await request.post(urlData.urlOfCreateAttribute, {
      data: attributePayload,
      headers: headerOfCreateAttribute,
    });
    if (res.status() === 200) {
      const createAttrRes = await res.json();
      attributeUUID = createAttrRes.customAttributeUuid;
      const matchingOption = createAttrRes.options.find(
        (opt) => opt.value === CONFIG.attributeValue,
      );
      attributeValueUUID = matchingOption?.optionUuid;
      logger.info(`Attribute "${CONFIG.attributeName}" created`);
      logger.info(`Attribute UUID: ${attributeUUID}`);
      logger.info(`Attribute Value UUID: ${attributeValueUUID}`);
    } else {
      const errorRes = await res.text();
      logger.info(`Attribute creation response: ${res.status()} - ${errorRes}`);
    }
  });

  test("Create or Get Audience", async ({ request }) => {
    // Check if audience already exists
    let existingAudienceUUID = await getAllAudienceApi(
      CONFIG.audienceName,
      request,
      jwt,
    );

    if (existingAudienceUUID) {
      audienceUUID = existingAudienceUUID;
      logger.info(`Audience "${CONFIG.audienceName}" already exists`);
      logger.info(`Audience UUID: ${audienceUUID}`);
    } else {
      logger.info(
        `Audience "${CONFIG.audienceName}" not found, creating new one`,
      );
    }

    // Create audience if it doesn't exist
    if (!audienceUUID) {
      // Get owner ID from stored users response
      let adminLoginId = config.get("Admindata").loginID;
      let adminUser = allUsersResponse.users.find(
        (user) => user.loginName.toLowerCase() === adminLoginId.toLowerCase(),
      );
      if (adminUser) {
        ownerData.push(adminUser.id);
      }
      logger.info(`Owner ID: ${ownerData}`);

      // Create new audience
      let headerofaudi = headerData.audienceCreateapiHeaders(
        jwt,
        "application/json",
      );
      const res = await request.post(urlData.audienceCreationUrl, {
        data: createAudiencePayload(
          CONFIG.audienceName,
          attributeUUID,
          [attributeValueUUID],
          ownerData,
        ),
        headers: headerofaudi,
      });
      const createAudiRes = await res.json();
      expect(res.status()).toBe(200);
      audienceUUID = createAudiRes.audienceUuid;
      logger.info(`Audience "${CONFIG.audienceName}" created`);
      logger.info(`Audience UUID: ${audienceUUID}`);
    }

    // Get all license pools from the organization
    try {
      let response = await apiresponseValidations.getLicencePoolOfOrganisation(
        request,
        urlData.getAllLicencePoolsUrl,
        jwt,
      );
      expect(response.status()).toBe(200);
      let res = await response.json();
      let licencepoolData =
        await reusableFunctions.countIdsInLicencePoolandPrint(res);
      let licencePoolsActuallyInOrg = licencepoolData.ids;
      logger.info(
        `Found ${licencepoolData.countOfLicencePool} license pools in organization`,
      );

      // Append all license pools to the audience
      if (licencePoolsActuallyInOrg && licencePoolsActuallyInOrg.length > 0) {
        for (let licencePoolID of licencePoolsActuallyInOrg) {
          try {
            let addPoolRes = await request.post(urlData.addlicencePoolUrl, {
              data: addlicencePoolApipayload(audienceUUID, licencePoolID),
              headers: headerData.addlicencePoolHeaders(
                jwt,
                "application/json",
              ),
            });
            if (addPoolRes.status() === 200) {
              logger.info(
                `Added licencePoolID: ${licencePoolID} to audience: ${audienceUUID}`,
              );
            } else {
              logger.error(
                `Failed to add licencePoolID: ${licencePoolID} to audience: ${audienceUUID} (Status: ${addPoolRes.status()})`,
              );
            }
          } catch (error) {
            logger.error(
              `Tried to add licencePoolID: ${licencePoolID} to audience: ${audienceUUID} but failed, may be it has been already appended or licencepool not there in org`,
            );
          }
        }
        logger.info(
          `Completed appending ${licencePoolsActuallyInOrg.length} license pools to audience "${CONFIG.audienceName}"`,
        );
      } else {
        logger.info(`No license pools found in organization to append`);
      }
    } catch (error) {
      logger.error(`Error getting license pools: ${error}`);
    }
  });

  test("Update PreExisting Admin User with Custom Attributes", async ({
    request,
  }) => {
    if (!attributeUUID) {
      logger.error("Attribute UUID not found");
      return;
    }

    // Use stored users response
    const adminLoginId = config.get("Admindata").loginID.toLowerCase();
    const targetUser = allUsersResponse.users.find(
      (user) =>
        user.loginName?.toLowerCase() === adminLoginId ||
        user.externalId?.toLowerCase() === adminLoginId,
    );

    if (!targetUser) {
      logger.error(`User ${config.get("Admindata").loginID} not found`);
      return;
    }

    const result = await updateUserWithCustomAttributesApi(
      request,
      jwt,
      targetUser.id,
      targetUser.externalId,
      attributeUUID,
      CONFIG.attributeValue,
    );
    expect(result.success).toBe(true);
  });

  test("Create User with Attribute", async ({ request }) => {
    test.skip(
      !siteUserData,
      `No siteUserData for domain ${currentDomain}. Add siteUser in childSitesConfig.json for this site to create the user.`,
    );

    // Get roleUuid from admin user using stored users response
    const adminLoginId = config.get("Admindata").loginID.toLowerCase();
    const adminUser = allUsersResponse.users.find(
      (user) =>
        user.loginName?.toLowerCase() === adminLoginId ||
        user.externalId?.toLowerCase() === adminLoginId ||
        user.email?.toLowerCase() === adminLoginId,
    );

    if (!adminUser || !adminUser.roleUuid) {
      logger.error(`Admin user or roleUuid not found for ${adminLoginId}`);
      return;
    }

    logger.info(
      `Using roleUuid: ${adminUser.roleUuid} from admin: ${adminUser.loginName}`,
    );

    let headerOfCreateUser = headerData.createUserHeader(
      jwt,
      "application/json",
    );
    const userPayload = {
      status: "active",
      is_lx_studio_accessor: true,
      first_name: siteUserData.firstName,
      is_lx_studio_publisher: true,
      last_name: siteUserData.lastName,
      external_id: siteUserData.email,
      login_name: siteUserData.email,
      email: siteUserData.email,
      password: CONFIG.newUserPassword,
      role_uuid: adminUser.roleUuid,
      custom_attributes: [
        {
          custom_attribute_id: attributeUUID,
          value: [CONFIG.attributeValue],
          type_name: "VALUE",
        },
      ],
    };

    const res = await request.post(urlData.createUserUrl, {
      data: userPayload,
      headers: headerOfCreateUser,
    });
    expect(res.status()).toBe(200);
    const createUserRes = await res.json();
    logger.info(`User created: ${siteUserData.email}`);
    logger.info(`User UUID: ${createUserRes.id || createUserRes.uuid}`);
  });
});
