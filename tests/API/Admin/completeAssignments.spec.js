import {
  test,
  generateToken,
  conentCompletionApi,
  getAllUserApi,
  getAllAssignmentsApi,
  getSingleAssignmentInfoApi,
  reusableFunctions,
  config,
  logger,
} from "../../../path.js";

let jwt,
  allUserResponse,
  contentUUIDArray = [],
  getAllAssignmentsResponse,
  adminUserId,
  orgId,
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

test("Extract Users and store them in userArray", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(50000);
  //get adminuserid to pass to content completion api
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
});

test(`Get Content UUID's and hit content Completion Api`, async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(2500000);
  //code to get content ID's from Assignment
  getAllAssignmentsResponse = await getAllAssignmentsApi(request, jwt);
  for (let i = 0; i <= process.env.numberOfTimesToRunScript; i++) {
    let shuffledUsers = reusableFunctions.shuffleDataInArray(
      allUserResponse.users
    );
    userUUIDArray = reusableFunctions
      .limitTheArrayData(shuffledUsers, 40)
      .map((item) => {
        logger.info(`About to complete assignments for user ${item.loginName}`);
        return item.id;
      });
    let num = reusableFunctions.pickRandomNumberFromArray([5, 8, 7, 9, 6, 10]);
    logger.info("Number of assignments picked in this run are:" + num);
    let assignments = reusableFunctions.limitTheArrayData(
      reusableFunctions.shuffleDataInArray(totalData.AssignmentData),
      num
    );
    logger.info(assignments);
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
          logger.info(
            `assignment ${assignment.name} content has been extracted`
          );
        }
      }
    }
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
    await reusableFunctions.setTimer(5000);
  }
  // } catch (e) {
  //   logger.info(`Unable to complete content for the users due to error: ${e}`);
  // }
});
