import { test } from "@playwright/test";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { logger } from "../../../logger.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { courseCompletionLP } from "../../../pageObjects/courseCompletion.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { contentLaunchEventApi } from "../../../helpers/API/apibuilders/contentLaunchEventApi.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { createSBAssessmentApi } from "../../../helpers/API/apibuilders/createSBAssessment.js";
import { searchContentandGetUUIDSApi } from "../../../helpers/API/apibuilders/searchContentandGetUUIDS.js";
import { achivementsDataApi } from "../../../helpers/API/apibuilders/achivementsDataApi.js";
import { config } from "../../../path.js";

let jwt, num, allUserResponse, completions, uniqueContentLaunches;

/** How many parallel UI runs to register (each is its own test in the report). */
const UNIQUE_VISITOR_COUNT = 500;
const DEMO_COURSE_TITLE = "Software Project Management Communication Skills";
const LEARNER_PASSWORD = config.get("Admindata").password;
const CONTENT_LAUNCHES_PER_LEARNER = 11;

test.beforeAll("get Token and org users", async ({ request }) => {
  jwt = await generateToken(request);
  allUserResponse = await getAllUserApi(request, jwt);
});

test.describe("Executive dashboard", () => {
  // One block: API test + visitor tests all schedule in parallel (max concurrent = --workers).
  test.describe.configure({ mode: "parallel" });

  test("Unique content accesses — API launches per learner (inner parallel)", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(5_500_000);

    let contentItemUUIDS = await searchContentandGetUUIDSApi(
      request,
      jwt,
      500,
      "skillbenchmark",
    );
    let targetNumber = await getNumberOfUsersAndContent(request, jwt);
    logger.info(targetNumber);
    const assessmentContentIds = contentItemUUIDS[0].data.search.results
      .filter((result) => result.contentType === "ASSESSMENT")
      .map((result) => result.contentId);
    logger.info(`Number of assesments:${assessmentContentIds.length}`);

    for (let person = 0; person <= targetNumber; person++) {
      const user = getRandomUser(allUserResponse);
      const learnerToken = await generateTokenLearner(
        request,
        user.loginName,
        LEARNER_PASSWORD,
      );
      await Promise.all(
        Array.from({ length: CONTENT_LAUNCHES_PER_LEARNER }, async () => {
          const asseUUID = getRadomContentID(assessmentContentIds);
          try {
            const randomUUID1 = reusableFunctions.uuidGenerator();
            const randomUUID2 = reusableFunctions.uuidGenerator();
            await contentLaunchEventApi(
              request,
              learnerToken,
              asseUUID,
              randomUUID1,
              randomUUID2,
            );
            await createSBAssessmentApi(request, asseUUID, learnerToken);
            logger.info(
              `Content : ${asseUUID} has been accessed by user :${user.loginName}`,
            );
          } catch {
            logger.info(
              `Content : ${asseUUID} has not accessed by user :${user.loginName}`,
            );
          }
        }),
      );
    }
  });

  for (let i = 0; i < UNIQUE_VISITOR_COUNT; i++) {
    test(`visitor ${i}`, async ({ browser }, testInfo) => {
      testInfo.setTimeout(5_500_000);
      await runUniqueVisitorSession(browser, allUserResponse, i);
    });
  }
});

/**
 * One learner: open org → login → popups → search course → open → logout.
 * `orgUsersResponse` is `allUserResponse` from `beforeAll`. Keeps `page` local so parallel workers never share browser state.
 */
async function runUniqueVisitorSession(
  browser,
  orgUsersResponse,
  iterationIndex,
) {
  let page;
  let user;
  try {
    page = await browser.newPage();
    const loginPage = new loginLPUiPage(page);
    const coursePage = new courseCompletionLP(page);
    user = getRandomUser(orgUsersResponse);
    logger.info(`logging in with user: ${user.loginName}`);
    await loginPage.openBrowser();
    await loginPage.login(user.loginName, LEARNER_PASSWORD);
    await page.waitForTimeout(5000);
    await coursePage.popupHandlerinHomepage();
    await page.waitForTimeout(3000);
    await coursePage.explorePercipioPopupHandler();
    await coursePage.searchTheCourse(DEMO_COURSE_TITLE);
    await coursePage.clickOnCourse(DEMO_COURSE_TITLE);
    logger.info(`${DEMO_COURSE_TITLE} accessed by user ${user.loginName}`);
    await loginPage.logout();
  } catch (error) {
    const who = user?.loginName ?? "unknown";
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Unique visitor #${iterationIndex} failed for ${who}: ${msg}`);
    throw error;
  } finally {
    if (page && !page.isClosed()) {
      await page.close().catch(() => {});
    }
  }
}

function getRandomUser(orgUsersResponse) {
  let users = orgUsersResponse.users;
  let randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}

function getRadomContentID(contentItemUUIDS) {
  let randomIndex = Math.floor(Math.random() * contentItemUUIDS.length);
  return contentItemUUIDS[randomIndex];
}

async function getNumberOfUsersAndContent(request, jwt) {
  let resp = await achivementsDataApi(request, jwt);
  completions =
    resp[0].data.dwExecDashboardAchievementByOrg.totalRange.data1.value;
  uniqueContentLaunches =
    resp[0].data.dwExecDashboardAchievementByOrg.totalRange.data2.value;
  logger.info(
    `Completions : ${completions} && Unique content launches : ${uniqueContentLaunches}`,
  );
  if (uniqueContentLaunches < completions) {
    num = completions - uniqueContentLaunches;
    let result = Math.floor(num / 11);
    return result;
  } else {
    return 10;
  }
}
