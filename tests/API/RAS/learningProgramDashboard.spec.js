import {
  test,
  getAllAudienceApi,
  reusableFunctions,
  getAudienceUsersApi,
  getAllUserApi,
  config,
  generateToken,
  logger,
  conentCompletionApi,
} from "../../../path.js";

let token,
  allUserResponse,
  content,
  adminUserId,
  shuffledUsers,
  orgId,
  allUsersFromSpecifiAud;

let defaultUserFileName = "defaultUsers";
let fileName = process.env.FileName;
let createLearningProgramdatapath = reusableFunctions.getPath(
  "testData/learningPrograms",
  `${fileName}.json`
);

let defaultUsersdataPath = reusableFunctions.getPath(
  "testData/usersData",
  `${defaultUserFileName}.json`
);

let createLearningProgramdata = reusableFunctions.readDatafromJsonFilenotasync(
  createLearningProgramdatapath
);
let totalData = createLearningProgramdata.learningPrograms;

let userdata =
  reusableFunctions.readDatafromJsonFilenotasync(defaultUsersdataPath);
let totalDataofDefaultUsers = userdata.defaultUsersData;

test.beforeAll("get jwt Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(90000);
  token = await generateToken(request);
  orgId = config.get("Environment").orgId;
  let audid = await getAllAudienceApi("Region", request, token);
  allUsersFromSpecifiAud = await getAudienceUsersApi(
    request,
    token,
    audid,
    "Region"
  );
});

test("Get User and store them in userArray", async ({ request }, testInfo) => {
  testInfo.setTimeout(50000);
  //get adminuserid to pass to content completion api
  allUserResponse = await getAllUserApi(request, token);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
});

test(`Get Content UUID's and hit content Completion Api`, async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(1800000);
  let date = reusableFunctions.getPreviousDayFormattedDate();
  content = getAllContentIds(totalData);

  //hitting for default users

  let defaultUsersResp = fetchAllUserIds(
    totalDataofDefaultUsers,
    allUsersFromSpecifiAud.users
  );
  let contentItemsForDefaultUsers = content.uniqueContentIds;
  let dataForContentCompletion =
    reusableFunctions.createJsonObjectwithjustUUIDS(
      defaultUsersResp,
      contentItemsForDefaultUsers,
      date
    );

  await conentCompletionApi(
    request,
    token,
    orgId,
    adminUserId,
    dataForContentCompletion
  );

  for (let i = 0; i < 20; i++) {
    logger.info(`Iteration:${i + 1}`);
    let contentItemsForThisIteration =
      Math.random() > 0.5
        ? content.uniqueContentIds
        : content.uniqueVideoContentIds;
    shuffledUsers = reusableFunctions.shuffleDataInArray(
      allUsersFromSpecifiAud.users
    );
    logger.info(contentItemsForThisIteration);
    let userUUIDArray = reusableFunctions
      .limitTheArrayData(shuffledUsers, 25)
      .map((item) => {
        logger.info(`About to complete course for user ${item.loginName}`);
        return item.id;
      });

    let dataForContentCompletion =
      reusableFunctions.createJsonObjectwithjustUUIDS(
        userUUIDArray,
        contentItemsForThisIteration,
        date
      );

    await conentCompletionApi(
      request,
      token,
      orgId,
      adminUserId,
      dataForContentCompletion
    );
    // logger.info(conentCompletionApiResp);
  }
});

function getAllContentIds(data) {
  let titles = [
    "Becoming Resilient for Growth",
    "The Psychological Safety Mindset",
    "Welcome to the Skillsoft Leadership Development Program",
    "Team Leadership Approaches",
  ];
  // Extract content and video content IDs, ensuring uniqueness
  let contentIds = new Set();
  let videoContentIds = new Set();
  data.forEach((program) => {
    if (
      program.lpenrollmentType == "assign" &&
      !titles.includes(program.lptitle)
    ) {
      program.lpcontents.forEach((content) => {
        if (
          !["ASSESSMENT", "SCHEDULED_CONTENT"].includes(content.contentType)
        ) {
          contentIds.add(content.contentId);
        }
        if (content.contentType === "Video") {
          videoContentIds.add(content.contentId);
        }
      });
    }
  });

  let uniqueContentIds = Array.from(contentIds);
  let uniqueVideoContentIds = Array.from(videoContentIds);
  return { uniqueContentIds, uniqueVideoContentIds };
}

function fetchAllUserIds(totalDataofDefaultUsers, users) {
  const matchedIds = [];
  totalDataofDefaultUsers.forEach((defaultUser) => {
    const matchingUser = users.find(
      (user) => user.loginName === defaultUser.loginName
    );
    if (matchingUser) {
      logger.info(
        `About to complete course for user ${matchingUser.loginName}`
      );
      matchedIds.push(matchingUser.id);
    }
  });
  return matchedIds;
}
