import { test, logger, generateToken, findUserByEmailOrExternalId, getAllAssignmentsApi, getJourneyInfo, getAllJourniesApi, getSingleAssignmentInfoApi, reusableFunctions, conentCompletionApi, config } from "../../../path.js";

const { primary: fileName, secondary: badgeFileName } =
  reusableFunctions.splitFileNameEnv(
    process.env.FileName || "presales1bUsers,earnBadgesForSalesTeam",
  );
if (!fileName || !badgeFileName) {
  throw new Error(
    "Set FileName=userDataBasename,badgeDataBasename (e.g. presales1bUsers,earnBadgesForSalesTeam)",
  );
}
let jwt,
  getAllAssignmentsResponse,
  getallJourneyResponse,
  contentOfAssignmentsUUIDS,
  contentOfJourneyUUIDS,
  date,
  adminUserId,
  chunkedUserUUIDAndNames,
  dataForContentCompletion,
  orgId;
let allUserUUIDS = [];
let missingUsers = [];
let salesUserTestDataFilePath = reusableFunctions.getPath(
  "testData/usersData",
  `${fileName}.json`
);
let userdata = reusableFunctions.readDatafromJsonFilenotasync(
  salesUserTestDataFilePath
);

let earnBadgeDataFilepath = reusableFunctions.getPath(
  "testData/badgesTestData",
  `${badgeFileName}.json`
);
let earnBadgeData = reusableFunctions.readDatafromJsonFilenotasync(
  earnBadgeDataFilepath
);

let totalDataFromBadgeDataFile = earnBadgeData.data;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Get users", async ({ request }) => {
  test.setTimeout(5000000);
  // Search each sales-team email with UCM q so users outside the first 12,500 page still resolve.
  for (let userName of userdata.users) {
    let user = await findUserByEmailOrExternalId(request, jwt, userName);
    if (user) {
      allUserUUIDS.push({
        userId: user.id,
        loginName: user.email || user.loginName || user.externalId,
      });
    } else {
      missingUsers.push(userName);
    }
  }
  if (allUserUUIDS.length === userdata.users.length) {
    logger.info("All User ids have been fetched");
  } else {
    logger.info("Some user ids has not been fetched");
  }

  logger.info(`Learner Data: ${allUserUUIDS.length} users`);
  logger.info(allUserUUIDS.map((user) => user.userId));
  logger.info(`Missing users : ${missingUsers.length}`);
  if (missingUsers.length) {
    logger.info(missingUsers.join(", "));
  }

  //  Extracting assignment UUIDS
  getAllAssignmentsResponse = await getAllAssignmentsApi(request, jwt);
  contentOfAssignmentsUUIDS =
    await reusableFunctions.extractContentUUIDsFromAssignments(
      totalDataFromBadgeDataFile.AssignmentData,
      getAllAssignmentsResponse.data,
      getSingleAssignmentInfoApi,
      request,
      jwt,
      logger
    );
  contentOfAssignmentsUUIDS =
    reusableFunctions.removingDuplicateElementsFromArrayUsingSet(
      contentOfAssignmentsUUIDS
    );

  logger.info(contentOfAssignmentsUUIDS);

  // Extracting data UUIDS from Journey
  getallJourneyResponse = await getAllJourniesApi(request, jwt);
  contentOfJourneyUUIDS = await reusableFunctions.extractJourneyContentUUIDs(
    totalDataFromBadgeDataFile.JourneyData,
    getallJourneyResponse.respofAllJourneyApiData,
    getJourneyInfo,
    request,
    jwt,
    logger
  );
  contentOfJourneyUUIDS =
    reusableFunctions.removingDuplicateElementsFromArrayUsingSet(
      contentOfJourneyUUIDS
    );
  logger.info(contentOfJourneyUUIDS);

  // merging UUIDS of  assignments and Journeys
  const mergedUUIDS = [
    ...new Set(contentOfAssignmentsUUIDS.concat(contentOfJourneyUUIDS)),
  ];
  logger.info(mergedUUIDS);

  ////////// Get Org id  and admin id to pass to conentCompletionApi api
  orgId = config.get("Environment").orgId;
  logger.info(`OrgId:${orgId}`);

  // Same q search for the Percipio admin; content completion requires their user id.
  let adminUser = await findUserByEmailOrExternalId(
    request,
    jwt,
    config.get("Admindata").loginID,
  );
  if (adminUser) {
    adminUserId = adminUser.id;
    logger.info(`adminUserId: ${adminUserId}`);
  } else {
    logger.error("Unable to find admin data");
  }

  // hitting content completion api for chunks of users
  date = reusableFunctions.getPreviousDayFormattedDate();
  chunkedUserUUIDAndNames = reusableFunctions.getChunks(allUserUUIDS, 80);
  logger.info(chunkedUserUUIDAndNames.length);
  for (let data of chunkedUserUUIDAndNames) {
    const userUUIDS = data.map((user) => user.userId);
    dataForContentCompletion = reusableFunctions.createJsonObjectwithjustUUIDS(
      userUUIDS,
      mergedUUIDS,
      date
    );
    await conentCompletionApi(
      request,
      jwt,
      orgId,
      adminUserId,
      dataForContentCompletion
    );
  }
});
