import {
  test,
  logger,
  generateTokenLearner,
  reusableFunctions,
  createStudyGroupApi,
  getStudyGroupShareLinkApi,
  loginLPUiPage,
  getAllUserApi,
  generateToken,
  config,
} from "../../../path.js";

const userDataBasename =
  (process.env.FileName || "").trim() || "defaultUsers";
let pathofuserData = reusableFunctions.getPath(
  "testData/usersData",
  `${userDataBasename}.json`,
);
let userDataFromJson =
  reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
let finalData = userDataFromJson.defaultUsersData;
let loginNames = finalData.map((user) => user.loginName);
logger.info(`creating study group for users: ${loginNames}`);
let loginLPUiPageObj, page, user, userName, usersData, jwt;

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
  usersData = await getAllUserApi(request, jwt);
});

test.describe.parallel("Create studygroup", () => {
  loginNames.forEach((data) => {
    test(`Create Study Group for user: ${data}`, async ({
      request,
      browser,
    }) => {
      test.setTimeout(600000);
      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0];
      // sample dynamic inputs
      const title = `Study Group ${formattedDate}`;
      const assetId = "44a19474-2ab8-43bb-afdf-86400efe52e6";
      const assetType = "COURSE";
      let userToken = await generateTokenLearner(request, data, config.get("Admindata").password);

      let studyGroupId = await createStudyGroupApi(
        request,
        userToken,
        title,
        assetId,
        assetType,
      );

      logger.info(`✅ Challenge created with ID: ${studyGroupId}`);
      logger.info(
        `✅ Proceeding to enroll user to StudyGroup with ID: ${studyGroupId}`,
      );
      let studyGroupUrl = await getStudyGroupShareLinkApi(
        request,
        userToken,
        studyGroupId,
      );
      logger.info(`✅ Generated studygroup enrollment url: ${studyGroupUrl}`);
      let attempts = 0;

      while (attempts < 10) {
        try {
          attempts++;
          logger.info(`🔁 User ${attempts} to join Study Group`);
          page = await browser.newPage();
          loginLPUiPageObj = new loginLPUiPage(page);
          user = getRandomUser(usersData);
          userName = user.loginName;
          logger.info(`logging in with user: ${user.loginName}`);
          await loginLPUiPageObj.openStudyGroupLink(studyGroupUrl);
          await loginLPUiPageObj.login(user.loginName, config.get("Admindata").password);
          await loginLPUiPageObj.joinStudyGroup();
          logger.info(
            `✅ User ${userName} successfully joined Study Group on attempt ${attempts}`,
          );
        } catch (error) {
          logger.error(
            `❌ Attempt ${attempts} failed for user ${userName}: ${error}`,
          );
          if (attempts === 10) {
            throw new Error(
              `Failed to join Study Group after 10 attempts for user ${userName}`,
            );
          }
        } finally {
          if (page) {
            await page.close();
          }
        }
      }
    });
  });
});

function getRandomUser(usersData) {
  let users = usersData.users;
  let randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}
