import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { newUserPreScreens } from "../../../pageObjects/newuserpresteps.js";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import { getAllInterestofUserApi } from "../../../helpers/API/apibuilders/getAllInterests.js";
import { CONTENT } from "../../../testData/content/content.js";
import { SkillBenchMark } from "../../../pageObjects/skillBenchMarkCompletion.js";
import { courseCompletionLP } from "../../../pageObjects/courseCompletion";
import { matchingQuestions } from "../../../testData/quesandAnswers/matchingQuestions.js";
import { logger } from "../../../logger.js";
import { saveUserInterestApi } from "../../../helpers/API/apibuilders/saveUserInterestApi.js";

let userInterestData;
let newuUserPreStepsObj,
  loginLPUiPageObj,
  skillBenchMarkObj,
  courseCompletionLPObj;
let page;
let excelData;
let dynamic = reusableFunctions.toogleDynamic();
let fileName = process.env.FileName;

test.describe("Create data in ActivityDashBoard for course Completion @cucc", async () => {
  //test.describe.configure({ mode: "parallel" });
  test.beforeAll("read excel data", async () => {
    await readExcelData();
  });

  test(`course Completion`, async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(5500000);
    page = await browser.newPage();
    newuUserPreStepsObj = new newUserPreScreens(page);
    loginLPUiPageObj = new loginLPUiPage(page);
    skillBenchMarkObj = new SkillBenchMark(page);
    courseCompletionLPObj = new courseCompletionLP(page);

    for (let [index, user] of excelData.entries()) {
      try {
        await loginLPUiPageObj.openBrowser();
      } catch (error) {
        logger.info(
          `Browser launch issue, might be VPN issue or environment issue ${error}`
        );
      }
      logger.info(
        `Logging in with userName:${user.loginName} and password:${user.passWord}`
      );
      try {
        await loginLPUiPageObj.login(user.loginName, user.passWord);
      } catch (error) {
        logger.info("Data from excel is not read. Retry");
      }
      if (await loginLPUiPageObj.checkLibraryButton()) {
        await loginLPUiPageObj.validateHomePage();
      } else {
        let jwt = await generateTokenLearner(
          request,
          user.loginName,
          user.passWord
        );

        // inputForSecondScreen = userInterestData[effectiveIndex].AreaName;
        // inputForThirdScreen = userInterestData[effectiveIndex].Subjects;
        // await newuUserPreStepsObj.secondScreenIntro(inputForSecondScreen);
        // await newuUserPreStepsObj.thirdScreenIntro(inputForThirdScreen);

        if (index === 0) {
          userInterestData = await getAllInterestofUserApi(request, jwt);
        }

        let shuffledArray =
          reusableFunctions.shuffleDataInArray(userInterestData);
        let interestArray = [];
        for (let i = 0; i < shuffledArray.length; i++) {
          const element = shuffledArray[i];
          interestArray.push(element.AreaName);
          element.Subjects.forEach((sub) => interestArray.push(sub));
          break; // exits the loop after the first iteration
        }
        logger.info(`interestArray for user ${user.loginName}`);
        logger.info(JSON.stringify(`${interestArray}`));
        await saveUserInterestApi(request, jwt, interestArray);

        logger.info("This is new user and had seen all intro screens");
      }
      let courseData = CONTENT.courses;
      for (let data of courseData) {
        let matchingQuestionAnswersArray =
          matchingQuestions.answersOfMatchingQuestions;
        await completeCourse(
          data.title,
          data.answersOfCourse,
          data.contentType,
          matchingQuestionAnswersArray
        );
      }
      await loginLPUiPageObj.logout();
      await reusableFunctions.setTimer(4000);
    }
  });
});

async function completeCourse(
  courseName,
  courseAnswers,
  contentType,
  matchingQuestionAnswersArray
) {
  await loginLPUiPageObj.openBrowser(); // added this line as during automation after completion of intro screens. It again asking user to complete intro screens again.
  try {
    await skillBenchMarkObj.searchTheCourse(courseName);
    await skillBenchMarkObj.clickOnContent(courseName, contentType);
    await courseCompletionLPObj.takeTest();
    await courseCompletionLPObj.answerAllQuestionsCorrectly(
      courseAnswers,
      matchingQuestionAnswersArray
    );
    await courseCompletionLPObj.clickSubmitAnswer();
    await courseCompletionLPObj.nextQuestion(
      courseAnswers,
      matchingQuestionAnswersArray
    );
    await courseCompletionLPObj.closeFeedBackDialog();
    await reusableFunctions.setTimer(3000);
  } catch (error) {
    logger.info(error);
    test.fail();
  }
}

async function readExcelData() {
  if (dynamic) {
    excelData = await reusableFunctions.getExcelData();
  } else {
    let filepath = reusableFunctions.getPath(
      "testData/userExcel",
      `${fileName}.xlsx`
    );
    excelData = reusableFunctions.readDataFromExcel(filepath, "Sheet 1");
    logger.info(excelData);
  }
}
