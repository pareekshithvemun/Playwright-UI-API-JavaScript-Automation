import {
  expect,
  test,
  headerData,
  generateToken,
  urlData,
  logger,
  reusableFunctions,
  getAllAttributesApi,
  createAudiencePayload,
  apiresponseValidations,
  getAllUserApi,
  config,
  editAdminUser,
  generateTokenLearner,
} from "../../../path.js";

let jwt,
  ownerData = [],
  allUserResponse;
let pathofattributeData = "testData/attributeValues/attributeData.json";
let attrNames =
  reusableFunctions.readDatafromJsonFilenotasync(pathofattributeData);
let attributeValueUUid;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe("Get values linked to List attribute and create Audience with it", async () => {
  test("Get values Linked to List Attribute", async ({ request }) => {
    let respOfgetAttributeName = await getAllAttributesApi(
      request,
      jwt,
      attrNames.attributeData[0].attributeName
    );
    let response = await apiresponseValidations.getValuesofListAttribute(
      request,
      urlData.getValuesOfListAttriHeadersUrl(
        respOfgetAttributeName.customAttributeUuid
      ),
      jwt
    );
    let res = await response.json();
    let stringFormatOfJson = JSON.stringify(res, null, 2); // JSON.stringify is a JavaScript function that converts a JavaScript object into a JSON-formatted string.
    let parsedArray = JSON.parse(stringFormatOfJson);
    expect(response.status()).toBe(200);
    attributeValueUUid = parsedArray.map((item) => item.id);
  });

  test("Create Audience", async ({ request }, testInfo) => {
    testInfo.setTimeout(20000);
    let respOfgetAttributeName = await getAllAttributesApi(
      request,
      jwt,
      attrNames.attributeData[0].attributeName
    );
    allUserResponse = await getAllUserApi(request, jwt);
    //fetching uuid of admin data to add them as owner for audience which we are gonna create
    let admindata = ["Fergus_Tyler", "Carolyn_Stephenson", "Libby_Bright"];
    for (let data of admindata) {
      let learnerWithLoginName = allUserResponse.users.find(
        (user) => user.loginName === data
      );
      ownerData.push(learnerWithLoginName.id);
    }
    logger.info("adminUUIDS");
    logger.info(ownerData);

    let headerofaudi = headerData.audienceCreateapiHeaders(
      jwt,
      "application/json"
    );
    let audienceName = attrNames.attributeData[0].attributeName;
    const res = await request.post(urlData.audienceCreationUrl, {
      data: createAudiencePayload(
        audienceName,
        respOfgetAttributeName.customAttributeUuid, // this is attribute UUID
        attributeValueUUid, // this is UUID of value mapped to that attribute
        ownerData
      ),
      headers: headerofaudi,
    });
    const createAudiRes = await res.json();
    expect(res.status()).toBe(200);
    logger.info(`Aud ID: ${createAudiRes.audienceUuid}`);
  });
});

// test("Add Admin to region audience", async ({ request }, testInfo) => {
//   testInfo.setTimeout(20000);

//   // Step 1: Admin login IDs
//   const adminLoginNames = [
//     "kowshik.bikkina@skillsoft.com",
//     // "pareekshith.v@skillsoft.com",
//   ];

//   // Step 2: Fetch all users
//   const allUserResponse = await getAllUserApi(request, jwt);

//   // Step 3: Read attribute name from JSON
//   const pathOfAttributeData = "testData/attributeValues/attributeData.json";
//   const attrNames =
//     reusableFunctions.readDatafromJsonFilenotasync(pathOfAttributeData);

//   // Step 4: Get attribute UUID
//   const respOfGetAttribute = await getAllAttributesApi(
//     request,
//     jwt,
//     attrNames.attributeData[0].attributeName
//   );
//   let attributeUUID = respOfGetAttribute.customAttributeUuid;
//   logger.info(`attributeUUID:${attributeUUID}`);

//   // Step 5: Process each admin
//   for (let name of adminLoginNames) {
//     let matchedUser = allUserResponse.users.find(
//       (user) => user.loginName.toLowerCase() === name.toLowerCase()
//     );

//     if (matchedUser) {
//       // Use loginName directly as both username and login
//       let userToken = await generateTokenLearner(
//         request,
//         matchedUser.loginName,
//         config.get("Admindata").password
//       );
//       logger.info(`Adding Admin to audience ${name}`);
//       await editAdminUser(request, userToken, matchedUser.id, attributeUUID);
//     } else {
//       logger.error(`User not found for loginId: ${name}`);
//     }
//   }
// });

test("Add Admin to region audience", async ({ request }, testInfo) => {
  testInfo.setTimeout(20000);

  // Admin usernames with their passwords
  const adminUsers = [
    {
      loginName: "kowshik.bikkina@skillsoft.com",
      password: config.get("Admindata").password,
    },
    {
      loginName: "pareekshith.v@skillsoft.com",
      password: config.get("Admindata").password,
    },
    // {
    //   loginName: "clayton.crouch@skillsoft.com",
    //   password: "Welcome1",
    // },
  ];

  // Fetch all users
  const allUserResponse = await getAllUserApi(request, jwt);

  // Read attribute name
  const path = "testData/attributeValues/attributeData.json";
  const attrNames = reusableFunctions.readDatafromJsonFilenotasync(path);

  // Get attribute UUID
  const resp = await getAllAttributesApi(
    request,
    jwt,
    attrNames.attributeData[0].attributeName
  );
  const attributeUUID = resp.customAttributeUuid;
  logger.info(`attributeUUID: ${attributeUUID}`);

  // Loop through admin users
  for (const { loginName, password } of adminUsers) {
    const matchedUser = allUserResponse.users.find(
      (user) => user.loginName.toLowerCase() === loginName.toLowerCase()
    );

    if (matchedUser) {
      const userToken = await generateTokenLearner(
        request,
        loginName,
        password
      );
      logger.info(`Adding Admin ${loginName} to audience `);
      await editAdminUser(request, userToken, matchedUser.id, attributeUUID);
    } else {
      logger.error(`User not found for loginId: ${loginName}`);
    }
  }
});
