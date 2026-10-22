import {
  test,
  createLearningProgramBusineesObjectiveApi,
  getLearningProgramBusineesObjectiveApi,
  createLearningProgramApi,
  getAllAudienceApi,
  reusableFunctions,
  getAllUserApi,
  generateToken,
  logger,
  expect,
  getAllAttributesApi,
  createUserPayload,
  headerData,
  urlData,
  generateTokenLearner,
  config,
} from "../../../path.js";

let token,
  auduuid,
  adminId,
  Workforce_TransformationuserToken,
  userWithLoginName;

let fileName = process.env.FileName;
let createLearningProgramdatapath = reusableFunctions.getPath(
  "testData/learningPrograms",
  `${fileName}.json`,
);
let createLearningProgramdata = reusableFunctions.readDatafromJsonFilenotasync(
  createLearningProgramdatapath,
);
let totalData = createLearningProgramdata?.learningPrograms || [];
let userData = {
  loginName: "Workforce_Transformation",
  passWord: config.get("Admindata").password,
  userRole: "admin",
  email: "Workforce_Transformation@noemail.com",
  fName: "Workforce",
  lName: "Transformation",
  userID: "Workforce_Transformation",
  jobRole: "Learning and Development Specialist",
  attrValue1: "APAC",
  attrValue2: "HR",
  attrValue3: "Learning and Development Specialist",
  manager: "Libby_Bright",
  ProfilePicture:
    "https://cdn.bfldr.com/YWP0W9AT/at/89fgst6gs8t2t6mx3jjvsp/man_10.png?auto=webp&format=png",
};

test.beforeAll("get jwt Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(90000);
  token = await generateToken(request);
  logger.info(token);
  auduuid = await getAllAudienceApi("Region", request, token);
  let allUserResponse = await getAllUserApi(request, token, "Workforce");
  try {
    userWithLoginName = allUserResponse.users.find(
      (user) => user.loginName === "Workforce_Transformation",
    );

    if (userWithLoginName) {
      adminId = userWithLoginName.id;
      logger.info("Fetched user Workforce_Transformation");
      logger.info(adminId);
    } else {
      let pathofattributeData = "testData/attributeValues/attributeData.json";
      let attrNames =
        reusableFunctions.readDatafromJsonFilenotasync(pathofattributeData);
      let attruuids = [];

      // Retrieve attribute UUIDs
      for (let att of attrNames.attributeData) {
        let respOfgetAttributeName = await getAllAttributesApi(
          request,
          token,
          att.attributeName,
        );
        attruuids.push(respOfgetAttributeName.customAttributeUuid);
      }
      logger.info("Attribute UUIDs:", attruuids);

      let headerofcreatUser = headerData.createUserHeader(
        token,
        "application/json",
      );

      // Create user
      let response = await request.post(urlData.createUserUrl, {
        data: createUserPayload(
          userData.loginName,
          userData.passWord,
          userData.userRole,
          userData.email,
          userData.fName,
          userData.lName,
          userData.userID,
          userData.jobRole,
          attruuids[0],
          userData.attrValue1,
          attruuids[1],
          userData.attrValue2,
          attruuids[2],
          userData.attrValue3,
          await getManagerObject(userData.manager, token, request),
        ),
        headers: headerofcreatUser,
      });
      expect(response.status()).toBe(200);
      logger.info("User created successfully:", userData.loginName);
      userWithLoginName = await response.json();
      adminId = userWithLoginName.id;
      logger.info(`Admin Id is ${adminId}`);
    }
  } catch (error) {
    logger.info(`Failed to get user data due to error : ${error}`);
  }
  Workforce_TransformationuserToken = await generateTokenLearner(
    request,
    userData.loginName,
    userData.passWord,
  );
});

test.describe("Create Learning program", async () => {
  //  test.describe.configure({ mode: "parallel" });

  totalData.forEach((element) => {
    test(`Create Learning program ${element.lptitle}`, async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(90000);
      let objID = await fetchOrCreateBusinessObjective(
        request,
        token,
        element.lpbusinessObjective,
      );
      let date = reusableFunctions.getFormattedDate();
      await createLearningProgramApi(
        request,
        Workforce_TransformationuserToken,
        element.lptitle,
        element.lpdescription,
        element.lpgoal,
        objID,
        element.isContentOrderRequired,
        date,
        element.lpcategory,
        element.lpcontents,
        adminId,
        element.cohortname,
        auduuid,
        element.lpenrollmentType,
        element.msteamsRedirectUrl,
        element.lpaction,
      );
    });
  });
});

async function fetchOrCreateBusinessObjective(
  request,
  token,
  businessObjectiveName,
) {
  try {
    let getResponse = await getLearningProgramBusineesObjectiveApi(
      request,
      token,
    );
    let existingObjective = getResponse.data.find(
      (objective) => objective.name === businessObjectiveName,
    );
    if (existingObjective) {
      return existingObjective.id;
    } else {
      logger.info(
        `No active business objective with name "${businessObjectiveName}" found. Creating a new one...`,
      );
      let createResponse = await createLearningProgramBusineesObjectiveApi(
        request,
        token,
        businessObjectiveName,
      );
      return createResponse;
    }
  } catch (error) {
    console.error("Error in fetchOrCreateBusinessObjective:", error);
    throw error;
  }
}

async function getManagerObject(manager, jwt, request) {
  let managerObj = null;

  try {
    let allUserResponse = await getAllUserApi(request, jwt);

    if (manager && allUserResponse && allUserResponse.users) {
      managerObj = allUserResponse.users.find(
        (user) => user.loginName === manager,
      );
    }

    if (!managerObj) {
      logger.warn(
        `Manager with loginName ${manager} not found in the user list.`,
      );
    }
  } catch (error) {
    logger.error(
      `Failed to get managerObj of ${manager} due to error: ${error.message}`,
    );
  }

  return managerObj;
}
