import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
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
  allUserResponse,
  allJourneyResponse = [],
  contentUUIDArray = [],
  getAllAssignmentsResponse,
  adminUserId,
  orgId,
  shuffledUsers = [],
  userUUIDArray = [];
let fileName = process.env.FileName;
let earnBadgeDataFilepath = reusableFunctions.getPath(
  "testData/badgesTestData",
  `${fileName}.json`
);
let earnBadgeData = reusableFunctions.readDatafromJsonFilenotasync(
  earnBadgeDataFilepath
);
let totalData = earnBadgeData?.data || [];

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Create User and store them in userArray", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(50000);
  //get adminuserid to pass to content completion api
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);

  shuffledUsers = reusableFunctions.shuffleDataInArray(allUserResponse.users);
});

test(`Get Content UUID's and hit content Completion Api`, async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(500000);
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
          item.channelUuid
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
  let num = reusableFunctions.pickRandomNumberFromArray([5, 2, 7, 4, 3, 6, 10]);
  logger.info("Number of assignments picked in this run are:" + num);
  let assignments = reusableFunctions.limitTheArrayData(
    reusableFunctions.shuffleDataInArray(totalData.AssignmentData),
    num
  );
  for (let assign of assignments) {
    for (let assignment of getAllAssignmentsResponse.data) {
      if (
        assignment.name.trim() === assign.trim() &&
        assignment.status === "in_progress"
      ) {
        let singleAssignmentResponse = await getSingleAssignmentInfoApi(
          request,
          jwt,
          assignment.id
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

  logger.info("Content Array");
  logger.info(uniquecontentUUIDs);
  for (let i = 0; i <= process.env.numberOfTimesToRunScript; i++) {
    userUUIDArray = reusableFunctions
      .limitTheArrayData(shuffledUsers, 15)
      .map((item) => {
        logger.info(
          `About to complete assignments,tracks and journey for user ${item.loginName}`
        );
        return item.id;
      });
    logger.info("User Array");
    logger.info(userUUIDArray);
    let dataForContentCompletion =
      reusableFunctions.createJsonObjectwithjustUUIDS(
        userUUIDArray,
        uniquecontentUUIDs,
        date
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
      dataForContentCompletion
    );
    logger.info(conentCompletionApiResp);
    // } catch (e) {
    //   logger.info(`Unable to complete content for the users due to error: ${e}`);
    // }
  }
});
