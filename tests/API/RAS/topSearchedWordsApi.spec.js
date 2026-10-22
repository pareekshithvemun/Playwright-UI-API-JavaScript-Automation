import { test } from "@playwright/test";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import config from "config";
import { topSearchWords } from "../../../helpers/API/apibuilders/topSearchWordsApi.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getAllInterestofUserApi } from "../../../helpers/API/apibuilders/getAllInterests.js";
import { logger } from "../../../logger.js";
import { saveUserInterestApi } from "../../../helpers/API/apibuilders/saveUserInterestApi.js";
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
  "Compliance",
];
let userInterestData;
let excelData;

test.describe.configure({ mode: "parallel" });
test.beforeAll("Get excel data", async () => {
  excelData = await reusableFunctions.getExcelData();
});
test("create data in top Searched Terms Dashboard @topwords", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(4000000);
  for (let user of excelData) {
    let jwt = await generateTokenLearner(
      request,
      user.loginName,
      user.passWord,
    );

    let randomWords = reusableFunctions.getRandomWords(wordData, 10);

    for (let word of randomWords) {
      await topSearchWords(request, jwt, word);
      logger.info(`Searched ${word} for user ${user.loginName}`);
    }
  }
});

test("Create data in Top Skills Selected board @topwords", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(550000);

  for (let [index, user] of excelData.entries()) {
    let jwt = await generateTokenLearner(
      request,
      user.loginName,
      user.passWord,
    );

    if (index === 0) {
      userInterestData = await getAllInterestofUserApi(request, jwt);
    }

    let shuffledArray = reusableFunctions.shuffleDataInArray(userInterestData);
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
  }
});
