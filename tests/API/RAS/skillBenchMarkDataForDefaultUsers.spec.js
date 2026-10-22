import { test } from "@playwright/test";
import {
  getAllBMQuestionBanks,
  getAllBMQuestionsandAnsUuid,
} from "../../../helpers/API/qanda/skillBenchmark.js";
import { createSBAssessmentApi } from "../../../helpers/API/apibuilders/createSBAssessment.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { submitChallengeApi } from "../../../helpers/API/apibuilders/submitBMChallenge.js";
import { logger } from "../../../logger.js";
import { cpLoginPage } from "../../../pageObjects/cpLoginPage.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";

let learnerToken, cpToken, cpLoginPageObj;
let page, excelData, jwt, jwtTimes;

test.beforeAll(
  "Generate admin jwt and cp token and create Users",
  async ({ request, browser }, testInfo) => {
    testInfo.setTimeout(7000000);
    jwt = await generateToken(request);
    page = await browser.newPage();
    cpLoginPageObj = new cpLoginPage(browser,page);
    cpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage();
    jwtTimes = await reusableFunctions.jwtDecoder(cpToken);
  }
);
test.describe("Create SkillBenchMark Data for Default Users", async () => {
  test("Read Excel Data", async () => {
    let pathofuserData = "testData/usersData/defaultUsers.json";
    let defaultUsers =
      reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
    excelData = defaultUsers.defaultUsersData;
    logger.info(excelData);
  });

  test(`Complete BM for all Default Users`, async ({
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
      let skillBenchmarkArray = data.skillBenchMarkData;
      //cptoke regeneration logic
      for (let benchMark of skillBenchmarkArray) {
        let cptokenresponse = await refreshTokenIfNeededForCP(
          jwtTimes,
          browser,
          cpToken
        );
        cpToken = cptokenresponse.cpToken;
        if (cptokenresponse) {
          await answerSkillBenchMarkForUser(
            request,
            learnerToken,
            benchMark.BenchMarkUUID,
            benchMark.Level,
            cpToken
          );
          jwtTimes = cptokenresponse.jwtTimes;
        } else {
          logger.error(
            `There is no CP TOKEN So script haven't executed the answerSkillBenchMarkForUser block`
          );
        }
      }
    }
  });
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
  skillBMcategory,
  cpToken
) {
  let questionArray = [];
  let qandA = [];
  //qandA = await getAnswersFromCp(skillBenchmarkId, request, cpToken);
  let index = 0,
    response;
  logger.info(`Generated questionArray`);
  questionArray = await createAssesment(
    skillBenchmarkId,
    request,
    learnerToken
  );
  qandA = await getAnswersFromCp(skillBenchmarkId, request, cpToken);
  logger.info(`Generated qandA`);
  logger.info(qandA);
  let numberofQuestionsInSkillBenchMark = questionArray.length;
  logger.info(
    `Number of questions in this skillbenchmark is ${numberofQuestionsInSkillBenchMark}`
  );
  logger.info(`Index: ${index}`);
  let numberofQuestionsToBeAnsweredCorrectly =
    await reusableFunctions.decideNumberOfQuestionToBeAnsweredCorrectly(
      skillBMcategory,
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
    `completed benchmark for ${skillBenchmarkId} and skillBMcategory ${skillBMcategory} `
  );
}

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
