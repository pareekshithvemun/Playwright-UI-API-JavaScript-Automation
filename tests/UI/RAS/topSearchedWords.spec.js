import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import config from "config";
import { topSearchWords } from "../../../helpers/API/apibuilders/topSearchWordsApi.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { newUserPreScreens } from "../../../pageObjects/newuserpresteps";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage";
import {getAllInterestofUserApi} from "../../../helpers/API/apibuilders/getAllInterests.js";
import { logger } from "../../../logger.js";

let wordData = [
  "Java",
  "Python",
  "C++",
  "Csharp",
  "Javascript",
  "DataScience",
  "Ai",
  "NeuralNetworks",
  "Networking",
  "Devops",
  "ChatGPT",
  "Prompt Engineering",
  "LeaderShip",
  "Communication Skills",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Machine Learning",
  "Artificial Intelligence",
  "Cybersecurity",
  "Cloud Computing",
  "Big Data",
  "Blockchain",
  "Natural Language Processing",
  "Robotics",
  "Virtual Reality",
  "Internet of Things",
  "Software Development",
  "Compliance"
];
let userInterestData;
let newuUserPreStepsObj, loginLPUiPageObj;
let page;
let excelData;

test.describe.configure({ mode: "parallel" });
test.beforeAll("Get excel data", async () => {
  excelData = await reusableFunctions.getExcelData();
});
test("create data in top Searched Terms Dashboard @topwords", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(400000);
  for (let user of excelData) {
    let jwt = await generateTokenLearner(
      request,
      user.loginName,
      user.passWord
    );
    let randomWords =reusableFunctions.getRandomWords(wordData, 10);
    for (let word of randomWords) {
      await topSearchWords(request, jwt, word);
      logger.info(`Searched ${word} for user ${user.loginName}`);
    }
  }
});

test("Create data in Top Skills Selected board @topwords", async ({
  browser,request
}, testInfo) => {
  testInfo.setTimeout(550000);
  for (let [index, user] of excelData.entries()) {
    let inputForSecondScreen, inputForThirdScreen;
    page = await browser.newPage();
    newuUserPreStepsObj = new newUserPreScreens(page);
    loginLPUiPageObj = new loginLPUiPage(page);
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
      let jwt = await generateTokenLearner(request, user.loginName, user.passWord);
      if(index===0){
        userInterestData=await getAllInterestofUserApi(request,jwt);
      }
      let effectiveIndex = index % 11;
      inputForSecondScreen=userInterestData[effectiveIndex].AreaName;
      inputForThirdScreen=userInterestData[effectiveIndex].Subjects;
      await newuUserPreStepsObj.secondScreenIntro(inputForSecondScreen);
      await newuUserPreStepsObj.thirdScreenIntro(inputForThirdScreen);
      logger.info("This is new user and had seen all intro screens");
      await reusableFunctions.setTimer(500);
      await page.close();
    }
  }
});
