import { test } from "@playwright/test";
import {
  getAllBMQuestionBanks,
  getAllBMQuestionsandAnsUuid,
} from "../../../helpers/API/qanda/skillBenchmark.js";
import { createSBAssessmentApi } from "../../../helpers/API/apibuilders/createSBAssessment.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { submitChallengeApi } from "../../../helpers/API/apibuilders/submitBMChallenge.js";
import ExcelHelperAndDataGenerator from "../../../helpers/Excel/testdataofCreateuser.js";
import { logger } from "../../../logger.js";
import { cpLoginPage } from "../../../pageObjects/cpLoginPage.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getskillID } from "../../../testData/content/content.js";

let learnerToken, cpToken, cpLoginPageObj;
let page, excelData, jwt, jwtTimes;
let LpTokenErrorArray = {},
  CpTokenErrorArray = {};

let dynamic = reusableFunctions.toogleDynamic();

test.beforeAll(
  "Generate admin jwt and cp token and create Users",
  async ({ request, browser }, testInfo) => {
    testInfo.setTimeout(7000000);
    let userdata = new ExcelHelperAndDataGenerator();
    jwt = await generateToken(request);
    if (dynamic) {
      excelData = await reusableFunctions.testCreateUser(
        request,
        jwt,
        userdata
      );
    } else {
      let pathofuserData = "testData/usersData/defaultUsers.json";
      let defaultUsers =
        reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
      excelData = defaultUsers.defaultUsersData;
      logger.info(excelData);
    }

    page = await browser.newPage();
    cpLoginPageObj = new cpLoginPage(browser,page);
    cpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage();
    jwtTimes = await reusableFunctions.jwtDecoder(cpToken);
  }
);
test.describe("Populate data in SkillBenchMark DashBoard", async () => {
  let skillBenchmarkArray = await getskillID(
    process.env.NUMBEROFBENCHFROMEACHSUB
  ); // it take one benchmark from each subject if we enter one
  logger.info("skillBenchmarkArray that will be completing in current session");
  logger.info(skillBenchmarkArray);
  logger.info(
    `Total skillbenchmarks answered per each users in this run is ${skillBenchmarkArray.length}`
  );
  for (let i = 0; i < skillBenchmarkArray.length; i++) {
    test(`Complete BM ${skillBenchmarkArray[i]}`, async ({
      request,
      browser,
    }, testInfo) => {
      testInfo.setTimeout(1000000);
      for (let data of excelData) {
        learnerToken = await generateTokenLearner(
          request,
          data.loginName,
          data.passWord
        );
        //cptoke regeneration logic
        let cptokenresponse = await refreshTokenIfNeededForCP(
          jwtTimes,
          browser,
          cpToken
        );
        cpToken = cptokenresponse.cpToken;
        if (cptokenresponse && learnerToken) {
          await answerSkillBenchMarkForUser(
            request,
            learnerToken,
            skillBenchmarkArray[i],
            cpToken
          );
          jwtTimes = cptokenresponse.jwtTimes;
        } else {
          if (!learnerToken) {
            if (!LpTokenErrorArray[skillBenchmarkArray[i]]) {
              LpTokenErrorArray[skillBenchmarkArray[i]] = [];
            }
            LpTokenErrorArray[skillBenchmarkArray[i]].push(data.loginName);
            logger.error(
              `LearnerToken has been not generated for user ${data.loginName}`
            );
          }
          if (!cptokenresponse) {
            if (!CpTokenErrorArray[skillBenchmarkArray[i]]) {
              CpTokenErrorArray[skillBenchmarkArray[i]] = [];
            }
            CpTokenErrorArray[skillBenchmarkArray[i]].push(data.loginName);
            logger.error(
              `There is no CP TOKEN So script haven't executed the answerSkillBenchMarkForUser block`
            );
          }
        }
      }
    });
  }
  logger.info("LpTokenErrorArray", JSON.stringify(LpTokenErrorArray));
  logger.info(LpTokenErrorArray);
  logger.error("CpTokenErrorArray", CpTokenErrorArray);
  logger.info(CpTokenErrorArray);
  

});

async function getAnswersFromCp(
  skillBenchmarkId,
  request,
  cpToken,
  counter = 0
) {
  let questionbanks;
  let qandA = [];
  //Get all questions bank uuid's available in the benchmark
  try {
    questionbanks = await getAllBMQuestionBanks(
      request,
      skillBenchmarkId,
      cpToken
    );
    logger.info(questionbanks);
  } catch (error) {
    logger.error(
      `Unable to fetch question and answers for benchmark: ${skillBenchmarkId} due to error ${error}`
    );
  }
  //Push all questions and answers from each question bank to an array
  if (questionbanks) {
    for (var i = 0; i < questionbanks.length; i++) {
      let questionBankUuid = await questionbanks[i].questionBankUuid;
      let eachQA = await getAllBMQuestionsandAnsUuid(
        request,
        questionBankUuid,
        cpToken
      );
      qandA.push(eachQA);
    }
  } else {
    logger.error(`questionbanks is : ${questionbanks}`);
  }

  if (qandA.length === 0 && counter < 2) {
    logger.warn(`qandA is empty, retrying for ${counter} time...`);
    await getAnswersFromCp(skillBenchmarkId, request, cpToken, counter + 1);
  }
  logger.info(`Extracted qandA array is : ${qandA}`);
  return qandA;
}

async function createAssesment(skillBenchmarkId, request, learnerToken) {
  //Create a new assessment and extract QA into an array
  try {
    let response = await createSBAssessmentApi(
      request,
      skillBenchmarkId,
      learnerToken
    );
    logger.info(JSON.stringify(response));
    let questionArray = [];
    if (response) {
      let questionObj = await response[0].data.createChallenge.questions;
      for (let i = 0; i < questionObj.length; i++) {
        let questionUuid = await response[0].data.createChallenge.questions[i]
          .questionUuid;
        let challengeUuid = await response[0].data.createChallenge.questions[i]
          .challengeUuid;
        let questionType = await response[0].data.createChallenge.questions[i]
          .questionType;
        let questionPosition = await response[0].data.createChallenge.questions[
          i
        ].position;
        questionArray.push({
          questionType: questionType,
          questionPosition: questionPosition,
          questionuuid: questionUuid,
          challengeuuid: challengeUuid,
        });
      }
    } else {
      logger.error(
        `Questions has been not extracted from LP and response is ${JSON.stringify(
          response
        )}`
      );
    }

    logger.info(questionArray);
    return questionArray;
  } catch (error) {
    logger.error(`Unable to create assessment due to error: ${error}`);
  }
}

async function answerSkillBenchMarkForUser(
  request,
  learnerToken,
  skillBenchmarkId,
  cpToken
) {
  let questionArray = [];
  let qandA = [];

  //qandA = await getAnswersFromCp(skillBenchmarkId, request, cpToken);
  let categoyTypes = process.env.CATEGORYTYPE;
  categoyTypes = categoyTypes.split(" ");
  logger.info(`categoyTypes`);
  logger.info(categoyTypes);
  for (let category of categoyTypes) {
    let index = 0,
      response;
    logger.info(`Generated questionArray from LP`);
    qandA = await getAnswersFromCp(skillBenchmarkId, request, cpToken);
    logger.info(`Generated qandA from CP:`);
    logger.info(qandA);
    if(qandA.length>0){
    questionArray = await createAssesment(
      skillBenchmarkId,
      request,
      learnerToken
    );
    
    let numberofQuestionsInSkillBenchMark = questionArray.length;
    logger.info(
      `Number of questions in this skillbenchmark is ${numberofQuestionsInSkillBenchMark}`
    );
    logger.info(`Index: ${index}`);
    let numberofQuestionsToBeAnsweredCorrectly =
      await reusableFunctions.decideNumberOfQuestionToBeAnsweredCorrectly(
        category,
        numberofQuestionsInSkillBenchMark
      );
    logger.info(
      `number of questions to be answered correctly ${numberofQuestionsToBeAnsweredCorrectly}`
    );
    if (questionArray && qandA) {
      try {
        for (let element of questionArray) {
          if (index < numberofQuestionsToBeAnsweredCorrectly) {
            let answer, newanswer;
            for (let object of qandA) {
              // Iterate through each object in the current array
              for (let j = 0; j < object.length; j++) {
                // Check if the questionUuid matches the targetQuestionUuid
                if (element.questionuuid === object[j].questionUuid) {
                  // Parse the finalAnswersTxt and return it
                  answer = object[j].finalAnswersTxt;
                  logger.info(`Answer from sub array in qandA ${answer}`);
                  newanswer = answer.replace(/\\"/g, '"');
                  break;
                } else {
                  logger.info(`Answer not found in sub array ${j} from qandA`);
                }
              }
            }
            if (answer === undefined) {
              logger.info(`Answer is not found in qandA array`);
            }

            response = await submitChallengeApi(
              request,
              skillBenchmarkId,
              element.questionuuid,
              element.questionType,
              element.challengeuuid,
              element.questionPosition,
              newanswer,
              learnerToken
            );
          } else {
            response = await submitChallengeApi(
              request,
              skillBenchmarkId,
              element.questionuuid,
              element.questionType,
              element.challengeuuid,
              element.questionPosition,
              "null",
              learnerToken
            );
          }

          index++;
          logger.info(
            JSON.stringify({
              message: `This is the response of skillBenchmarkId: ${skillBenchmarkId} and questionuuid: ${
                element.questionuuid
              } is ${JSON.stringify(response)}`,
            })
          );
        }
      } catch (error) {
        logger.error(error);
      }
    } else {
      if (!questionArray) {
        logger.error(
          `Unable to fetch questionArray from LP for BenchMark: ${skillBenchmarkId}`
        );
      }
      if (!qandA) {
        logger.error(
          `Unable to fetch answers from cp for BenchMark: ${skillBenchmarkId}`
        );
      }
    }
    logger.info(
      `completed benchmark for ${skillBenchmarkId} and category ${category} `
    );
  }
  else{
    logger.info(`Answers not found for BM : ${skillBenchmarkId} hence skipping this BM` )
  }
}
}

// function readExcelData() {
//   let data;
//   let filepath = reusableFunctions.getPath(
//     "testData/userExcel",
//     `${fileName}.xlsx`
//   );
//   data = reusableFunctions.readDataFromExcel(filepath, "Sheet 1");
//   logger.info(data);
//     return data;
// }

async function refreshTokenIfNeededForCP(jwtTimes, browser, cpToken) {
  const currentTime = Math.floor(Date.now() / 1000);
  logger.info(`currentTime: ${currentTime}`);
  logger.info(`jwt expiry : ${jwtTimes.exp}`);
  if (jwtTimes.exp <= currentTime) {
    let page = await browser.newPage();
    cpLoginPageObj = new cpLoginPage(browser,page);
    const newcpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage();
    const newJwtTimes = await reusableFunctions.jwtDecoder(cpToken);
    logger.info(
      `New jwt has been generated at ${JSON.stringify(
        newJwtTimes.iat
      )} as the last one expired`
    );
    return { jwtTimes: newJwtTimes, cpToken: newcpToken };
  } else {
    logger.info(`Still using the old CP token`);
    return { jwtTimes, cpToken };
  }
}

// logic is it answer one skillbenchmark at a time, after that it loop to each user that has been created. Then for each user select skill benchmark is answered twice
// skillbenchmark > user1 > answer  skillbenchmark in both categories
// skillbenchmark > user2 > answer  skillbenchmark in both categories
