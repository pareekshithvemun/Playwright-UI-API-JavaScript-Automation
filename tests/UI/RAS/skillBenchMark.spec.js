import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { newUserPreScreens } from "../../../pageObjects/newuserpresteps.js";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import { getAllInterestofUserApi } from "../../../helpers/API/apibuilders/getAllInterests.js";
import { CONTENT } from "../../../testData/content/content.js";
import { SkillBenchMark } from "../../../pageObjects/skillBenchMarkCompletion.js";
import {matchingQuestions} from "../../../testData/quesandAnswers/matchingQuestions.js";
import { logger } from "../../../logger.js";


let userInterestData;
let newuUserPreStepsObj, loginLPUiPageObj, skillBenchMarkObj;
let page;
let excelData;
let dynamic = reusableFunctions.toogleDynamic();
let fileName = process.env.FileName;

test.describe("Create data in SkillBenchMarkdashBoard @benchmarkData", async () => {
    test.beforeAll("read excel data", async () => {
    await readExcelData();
  });

  test(`Data creation in SkillBenchMarkdashBoard`, async ({
    browser,
    request,
  }, testInfo) => {
    testInfo.setTimeout(5500000);
    let inputForSecondScreen, inputForThirdScreen;
    page = await browser.newPage();
    newuUserPreStepsObj = new newUserPreScreens(page);
    loginLPUiPageObj = new loginLPUiPage(page);
    skillBenchMarkObj = new SkillBenchMark(page);

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
        userInterestData = await getAllInterestofUserApi(request, jwt);
        let effectiveIndex = index % 11;
        inputForSecondScreen = userInterestData[effectiveIndex].AreaName;
        inputForThirdScreen = userInterestData[effectiveIndex].Subjects;
        await newuUserPreStepsObj.secondScreenIntro(inputForSecondScreen);
        await newuUserPreStepsObj.thirdScreenIntro(inputForThirdScreen);
        logger.info("This is new user and had seen all intro screens");
      }
      let benchmarkdata = CONTENT.SkillBenchMark;

      for (let data of benchmarkdata) {
        let matchingQuestionAnswersArray=matchingQuestions.answersOfMatchingQuestions;
        await completeTheBenchmark(
          data.title,
          data.answersOfBenchMark,
          data.contentType,
          matchingQuestionAnswersArray
        );
      }
      await loginLPUiPageObj.logout();
      await reusableFunctions.setTimer(4000);
    }
  });
});

async function completeTheBenchmark(
  benchMarkName,
  benchMarkAnswers,
  contentType,matchingQuestionAnswersArray
) {
  await loginLPUiPageObj.openBrowser(); // added this line as during automation after completion of intro screens. It again asking user to complete intro screens again.
  try {
  
    await skillBenchMarkObj.searchTheCourse(benchMarkName);
    await skillBenchMarkObj.clickOnContent(benchMarkName, contentType);
    if (await skillBenchMarkObj.checkBenchMarkIsAvailable()) {
      return;
    }
    let totalQuestionsinSkillBenchmark = await skillBenchMarkObj.getSkillBenchMarkquestionCount();
    await skillBenchMarkObj.startContent();
    let questionCounter = 1;
    await skillBenchMarkObj.answerAllQuestionsCorrectly(
      benchMarkAnswers,matchingQuestionAnswersArray,
      totalQuestionsinSkillBenchmark,
      process.env.CATEGORYTYPE,
      questionCounter
    );
    await skillBenchMarkObj.clickSubmitAnswer();
    await skillBenchMarkObj.nextQuestion(
      benchMarkAnswers,matchingQuestionAnswersArray,
      totalQuestionsinSkillBenchmark,
      process.env.CATEGORYTYPE,
      questionCounter
    );
    await skillBenchMarkObj.getSkillBenchMarkScore(benchMarkName);
    await skillBenchMarkObj.closeFeedBackDialogs();
    await reusableFunctions.setTimer(3000);
  } catch (error) {
    logger.info(error);
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
