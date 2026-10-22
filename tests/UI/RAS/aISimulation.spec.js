import { test } from "@playwright/test";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { logger } from "../../../logger.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { courseCompletionLP } from "../../../pageObjects/courseCompletion.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { aiSimulator } from "../../../pageObjects/aiSimulator.js";
import { config } from "../../../path.js";

let jwt,
  user,
  userName,
  aIcourseData,
  aiSimulatorObj,
  usersData,
  loginLPUiPageObj,
  courseCompletionLPObj,
  page;

test.beforeAll("get Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(80000);
  jwt = await generateToken(request);
  usersData = await getAllUserApi(request, jwt);
  let pathofAICourseData = "testData/aiSimulation/aiSimulationTestData.json";
  aIcourseData =
    reusableFunctions.readDatafromJsonFilenotasync(pathofAICourseData);
});

test.describe("AI simulation", async () => {
  test.describe.configure({ mode: "parallel" });
  for (let i = 0; i <= 9; i++) {
    // 6 courses. code will fail if we give number more than 6 becuase we have test data only for 6
    for (let k = 1; k < 30; k++) {
      // 9 users. we can this as much as we can
      test(`Complete Ai simulation for course ${i} & visitors ${k}`, async ({
        browser,
      }, testInfo) => {
        testInfo.setTimeout(400000);
        try {
          page = await browser.newPage();
          loginLPUiPageObj = new loginLPUiPage(page);
          courseCompletionLPObj = new courseCompletionLP(page);
          user = getRandomUser(usersData);
          userName = user.loginName;
          logger.info(`logging in with user: ${user.loginName}`);
          await loginLPUiPageObj.openBrowser();
          await loginLPUiPageObj.login(user.loginName, config.get("Admindata").password);
          await loginLPUiPageObj.skipIntroScreen();
          await courseCompletionLPObj.popupHandlerinHomepage();
          await courseCompletionLPObj.explorePercipioPopupHandler();
          await courseCompletionLPObj.searchTheCourse(
            aIcourseData.AISimulationTestData[i].AICourse
          );
          try {
            await courseCompletionLPObj.clickOnCourse(
              aIcourseData.AISimulationTestData[i].AICourse
            );
          } catch (error) {
            logger.error(JSON.stringify(error));
          }
          await courseCompletionLPObj.launchAISimulator();
          const page1 = await page.waitForEvent("popup");
          aiSimulatorObj = new aiSimulator(page1);
          await aiSimulatorObj.textInput.isVisible();
          await page1.waitForTimeout(9000);
          if (await aiSimulatorObj.agreeButton.isVisible()) {
            try {
              await aiSimulatorObj.agreeButton.click();
            } catch (error) {
              logger.error(JSON.stringify(error));
            }
          }
          await page1.waitForTimeout(6000);
          logger.info("Starting conversation");
          for (
            let j = 0;
            j < aIcourseData.AISimulationTestData[i].Answers.length;
            j++
          ) {
            await page1.waitForTimeout(5000);
            if (await aiSimulatorObj.textInput.isVisible()) {
              await aiSimulatorObj.sendText(
                aiSimulatorObj.textInput,
                aIcourseData.AISimulationTestData[i].Answers[j]
              );
              await aiSimulatorObj.clickEnterandWait();
            } else {
              logger.info("text input element is not visible");
            }
          }
          if (await aiSimulatorObj.endScenario.isVisible()) {
            await aiSimulatorObj.endScenario.click();
          } else {
            logger.info("end scenario element is not visible");
          }
          await page1.waitForTimeout(15000);
          logger.info(
            `Completed AI simulation for "${aIcourseData.AISimulationTestData[i].AICourse}" for "${userName}"`
          );
          await aiSimulatorObj.closeSimulator();
          await page.close();
        } catch (error) {
          logger.error(
            `Failed to complete AI simulation "${aIcourseData.AISimulationTestData[i].AICourse}" for "${userName}" due to error ${error}`
          );
        }
      });
    }
  }
});

function getRandomUser(usersData) {
  let users = usersData.users;
  let randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}
