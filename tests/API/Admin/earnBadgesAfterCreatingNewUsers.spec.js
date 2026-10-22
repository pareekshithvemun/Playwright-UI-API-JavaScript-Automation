import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import ExcelHelperAndDataGenerator from "../../../helpers/Excel/testdataofCreateuser.js";
import { conentCompletionApi } from "../../../helpers/API/apibuilders/conentCompletion.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { getAllAssignmentsApi } from "../../../helpers/API/apibuilders/getallAssignments.js";
import { getJourneyInfo } from "../../../helpers/API/apibuilders/getJourneyInfo.js";
import { getAllJourniesApi } from "../../../helpers/API/apibuilders/getalljournies.js";
import { getSingleAssignmentInfoApi } from "../../../helpers/API/apibuilders/getSingleAssignmentInfoApi.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import config from "config";
import { logger } from "../../../logger.js";

let jwt,
  excelData,
  allUserResponse,
  allJourneyResponse = [],
  contentUUIDArray = [],
  getAllAssignmentsResponse,
  adminUserId,
  orgId,
  userUUIDArray = [];
let fileName = process.env.FileName;
let earnBadgeDataFilepath = reusableFunctions.getPath(
  "testData/badgesTestData",
  `${fileName}.json`,
);
let earnBadgeData = reusableFunctions.readDatafromJsonFilenotasync(
  earnBadgeDataFilepath,
);
let totalData = earnBadgeData?.data || [];

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Create User and store them in userArray", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(20000);
  let userdata = new ExcelHelperAndDataGenerator();
  excelData = await reusableFunctions.testCreateUser(request, jwt, userdata);

  //get adminuserid to pass to content completion api
  allUserResponse = await getAllUserApi(request, token);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);

  excelData.forEach((user) => {
    const matchingUser = allUserResponse.users.find(
      (item) => item.loginName === user.loginName,
    );
    if (matchingUser) {
      userUUIDArray.push(matchingUser.id);
      logger.info(`About to complete content for ${matchingUser.loginName}`);
    }
  });
});

test(`Get Content UUID's and hit content Completion Api`, async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(250000);
  // try {
  // code to get content ID's of tracks inside Journies
  allJourneyResponse = await getAllJourniesApi(request, jwt);
  for (let ele of totalData.JourneyData) {
    let alldataOfJouney = allJourneyResponse.respofAllJourneyApiData;

    for (let item of alldataOfJouney.channels) {
      if (
        item.status === 2 &&
        item.localizations[0].title === ele.JourneyName
      ) {
        let responseOfSingleJourney = await getJourneyInfo(
          request,
          jwt,
          item.channelUuid,
        );
        let response = responseOfSingleJourney.resp;
        response.channelViews.forEach((channel) => {
          ele.TrackName.forEach((trackName) => {
            if (
              channel.title === trackName &&
              channel.displayTypeName === "TRACK"
            ) {
              channel.contentItems.forEach((content) => {
                contentUUIDArray.push(content.contentItemUuid);
              });
            }
          });
          logger.info(`${channel.title} content has been extracted`);
        });
      }
    }
  }

  //code to get content ID's from Assignment
  getAllAssignmentsResponse = await getAllAssignmentsApi(request, jwt);
  for (let assign of totalData.AssignmentData) {
    for (let assignment of getAllAssignmentsResponse.data) {
      if (
        assignment.name.trim() === assign.trim() &&
        assignment.status === "in_progress"
      ) {
        let singleAssignmentResponse = await getSingleAssignmentInfoApi(
          request,
          jwt,
          assignment.id,
        );
        if (singleAssignmentResponse) {
          singleAssignmentResponse.contents.forEach((content) => {
            contentUUIDArray.push(content.contentItemUuid);
          });
        }
        logger.info(`assignment ${assignment.name} content has been extracted`);
      }
    }
  }
  logger.info(contentUUIDArray);
  // creating json to pass to conentCompletionApi api after removing duplicates from contentUUIDArray
  let uniquecontentUUIDs = [...new Set(contentUUIDArray)];
  let date = reusableFunctions.getPreviousDayFormattedDate();
  logger.info("User Array");
  logger.info(userUUIDArray);
  logger.info("Content Array");
  logger.info(uniquecontentUUIDs);
  let dataForContentCompletion =
    reusableFunctions.createJsonObjectwithjustUUIDS(
      userUUIDArray,
      uniquecontentUUIDs,
      date,
    );
  logger.info(dataForContentCompletion);

  ////////// Get Org id  to pass to conentCompletionApi api
  orgId = config.get("Environment").orgId;
  logger.info(`OrgId:${orgId}`);

  //hit content completion api
  let conentCompletionApiResp = await conentCompletionApi(
    request,
    jwt,
    orgId,
    adminUserId,
    dataForContentCompletion,
  );
  logger.info(conentCompletionApiResp);
  // } catch (e) {
  //   logger.info(`Unable to complete content for the users due to error: ${e}`);
  // }
});
