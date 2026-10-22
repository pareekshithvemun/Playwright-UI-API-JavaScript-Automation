import {
  test,
  generateToken,
  createAssignment,
  getBusinessObjective,
  reusableFunctions,
  getAllUserApi,
  getAllAudienceApi,
  logger,
} from "../../../path.js";

let jwt,
  userUUID = {},
  respofGetAllUsers,
  auduuid;
let fileName = process.env.FileName;
let assignmentDataFilepath = reusableFunctions.getPath(
  "testData/AssignmentTestData",
  `${fileName}.json`,
);
let assignmentData = reusableFunctions.readDatafromJsonFilenotasync(
  assignmentDataFilepath,
);
let totalData = assignmentData?.contentForAssignment || [];

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test(`Fetch users and audId`, async ({ request }, testInfo) => {
  testInfo.setTimeout(40000);
  try {
    let userData = ["Libby_Bright", "Carolyn_Stephenson", "Talent_Enablement"];
    respofGetAllUsers = await getAllUserApi(request, jwt);
    userData.forEach((user) => {
      let data = respofGetAllUsers?.users?.find((item) =>
        item.loginName.includes(user),
      );
      if (data) {
        userUUID[user] = data.id;
      } else {
        logger.info(`User "${user}" not found in org`);
      }
    });
  } catch (e) {
    logger.info(`Unable to get uuid due to error:${e}`);
  }

  try {
    auduuid = await getAllAudienceApi("Region", request, jwt);
  } catch (e) {
    logger.info(`Unable to get audid due to error:${e}`);
  }
});

test(`Create Assignment`, async ({ request }, testInfo) => {
  testInfo.setTimeout(250000);
  try {
    let userID;
    let respOfbusinessObjective = await getBusinessObjective(request, jwt);

    for (let data of totalData) {
      let businessObjectiveId = await reusableFunctions.findIdByName(
        data.BusinessObjective,
        respOfbusinessObjective,
      );
      //action: "save"(this will draft assignment)
      //action: "launch"(this will publish assignment)
      if (userUUID.hasOwnProperty(data.assignedBy)) {
        userID = userUUID[data.assignedBy];
      } else {
        userID = respofGetAllUsers.users[0].id;
      }
      // Resolve audience per assignment: data.audienceName or default "Region"
      let audienceUuidForAssignment = await getAllAudienceApi(
        data.audienceName || "Region",
        request,
        jwt,
      );
      if (!audienceUuidForAssignment) {
        audienceUuidForAssignment = auduuid;
      }
      let description =
        data.description ||
        "<p>Keep on track by completing assigned course</p>";
      await createAssignment(
        request,
        jwt,
        data.content,
        data.name,
        businessObjectiveId,
        data.expiry || 365,
        data.assignmentState,
        data.assGoal,
        userID,
        audienceUuidForAssignment,
        description,
      );
    }
  } catch (e) {
    testInfo.fail(true, `Assigment Creation has been failed due to error ${e}`);
  }
});
