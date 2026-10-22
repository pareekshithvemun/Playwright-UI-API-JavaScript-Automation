import { request, test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getAllAssignmentsApi } from "../../../helpers/API/apibuilders/getallAssignments.js";
import { getBusinessObjective } from "../../../helpers/API/apibuilders/getBusinessObjectives.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { getSingleAssignmentInfoApi } from "../../../helpers/API/apibuilders/getSingleAssignmentInfoApi.js";
import { conentCompletionApi } from "../../..//helpers/API/apibuilders/conentCompletion.js";
import { logger } from "../../../logger.js";
import config from "config";

let allUserUUIDS = [],
  jwt,
  shuffledUsers,
  chunkedUserUUIDAndNames,
  respOfbusinessObjective,
  allUsers,
  adminUserId,
  orgId,
  contentUUIDArray = [],
  getAllassignmentsResp,
  validAssignmentIDs = [],
  validBusinessObjectiveIds = [
    "0d9eec1b-2d36-4959-954e-523ec1d31b37",
    "d42e770b-0d38-4d54-b24f-acf9ab884ade",
  ],
  date;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test(`Edit Assignment DashBoard`, async ({ request }, testInfo) => {
  testInfo.setTimeout(9500000);
  respOfbusinessObjective = await getBusinessObjective(request, jwt);
  allUsers = await getAllUserApi(request, jwt);
  getAllassignmentsResp = await getAllAssignmentsApi(request, jwt);
  let userWithLoginName = allUsers.users.find(
    (user) => user.loginName === config.get("Admindata").loginID
  );
  if (userWithLoginName) {
    adminUserId = userWithLoginName.id;
  }
  orgId = config.get("Environment").orgId;
  logger.info(`adminUserId: ${adminUserId}, OrgId: ${orgId}`);

  validAssignmentIDs = getAllassignmentsResp.data
    .filter(
      (item) =>
        validBusinessObjectiveIds.includes(item.businessObjectiveId) &&
        item.status === "in_progress"
    )
    .map((item) => item.id);

  for (let i = 1; i <= 2; i++) {
    //  number of time this script will run
    console.log("validAssignmentIDs");
    validAssignmentIDs =
      reusableFunctions.shuffleDataInArray(validAssignmentIDs);
    console.log(validAssignmentIDs);

    for (let i = 0; i < Math.min(validAssignmentIDs.length, 4); i++) {
      // number of assignment ids sent in each run
      const id = validAssignmentIDs[i];
      let singleAssignmentResponse = await getSingleAssignmentInfoApi(
        request,
        jwt,
        id
      );
      if (singleAssignmentResponse?.contents) {
        for (let content of singleAssignmentResponse.contents) {
          contentUUIDArray.push(content.contentItemUuid);
        }
        logger.info(
          `content ${singleAssignmentResponse.name} has been extracted`
        );
      }
    }
    contentUUIDArray=reusableFunctions.removingDuplicateElementsFromArray(contentUUIDArray);

    date = reusableFunctions.getPreviousDayFormattedDate();

    shuffledUsers = reusableFunctions.shuffleDataInArray(allUsers.users);
    allUserUUIDS = reusableFunctions
      .limitTheArrayData(shuffledUsers, 100)
      .map((item) => {
        logger.info(`About to complete assignment for user ${item.loginName}`);
        return item.id;
      });
    chunkedUserUUIDAndNames = reusableFunctions.getChunks(allUserUUIDS, 15); // number of users in each run
    logger.info(chunkedUserUUIDAndNames.length);
    for (let data of chunkedUserUUIDAndNames) {
      let dataForContentCompletion =
        reusableFunctions.createJsonObjectwithjustUUIDS(
          data,
          contentUUIDArray,
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
    await reusableFunctions.setTimer(5000);
  }
});
