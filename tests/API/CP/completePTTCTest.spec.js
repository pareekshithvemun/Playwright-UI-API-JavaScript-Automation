import { test } from "@playwright/test";
import {
  courseuuidList,
  extractMatchigTypeQAoneachuuid,
  extractMultipleChoiceTypeQAoneachuuid,
} from "../../../helpers/API/qanda/getCourseList.js";
import {
  getAllBMQuestionBanks,
  getAllBMQuestions,
  getAllBMQuestionsandAnsUuid,
} from "../../../helpers/API/qanda/skillBenchmark.js";
import { createSBAssessmentApi } from "../../../helpers/API/apibuilders/createSBAssessment.js";
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { submitChallengeApi } from "../../../helpers/API/apibuilders/submitBMChallenge.js";
import { logger } from "../../../logger.js";
import { cpLoginPage } from "../../../pageObjects/cpLoginPage.js";
import { createTestApi } from "../../../helpers/API/apibuilders/createTestApi.js";
import { getCourseQandAApi } from "../../../helpers/API/apibuilders/getCourseQandAApi.js";
import { config } from "../../../path.js";

let learnerToken, cpToken, cpLoginPageObj, qestionsArray, answer, newanswer;
let page;

test.describe("E2E Test Suite", () => {
  test.beforeAll("get cpToken", async ({ request, browser }, testInfo) => {
    testInfo.setTimeout(1000000);
    learnerToken = await generateTokenLearner(
      request,
      "Raheem_Ahmed",
      config.get("Admindata").password
    );
    page = await browser.newPage();
    cpLoginPageObj = new cpLoginPage(browser, page);
    cpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage();
  });

  test("Complete BM", async ({ request }, testInfo) => {
    testInfo.setTimeout(400000);

    //Create a new assessment and extract QA into an array
    let response = await createSBAssessmentApi(
      request,
      "134ce46f-803f-49b8-b5d8-d7c7b5939158",
      learnerToken
    );
    logger.info(JSON.stringify(response));
    let questionArray = [];
    let questionObj = await response[0].data.createChallenge.questions;
    for (let i = 0; i < questionObj.length; i++) {
      let questionUuid = await response[0].data.createChallenge.questions[i]
        .questionUuid;
      let challengeUuid = await response[0].data.createChallenge.questions[i]
        .challengeUuid;
      let questionType = await response[0].data.createChallenge.questions[i]
        .questionType;
      let questionPosition = await response[0].data.createChallenge.questions[i]
        .position;
      questionArray.push({
        questionType: questionType,
        questionPosition: questionPosition,
        questionuuid: questionUuid,
        challengeuuid: challengeUuid,
      });
    }
    logger.info(questionArray);

    //Get all questions bank uuid's available in the benchmark
    let questionbanks = await getAllBMQuestionBanks(
      request,
      "134ce46f-803f-49b8-b5d8-d7c7b5939158",
      cpToken
    );
    logger.info(questionbanks);

    //Push all questions and answers from each question bank to an array
    let qandA = [];
    for (var i = 0; i < questionbanks.length; i++) {
      let questionBankUuid = await questionbanks[i].questionBankUuid;
      let eachQA = await getAllBMQuestionsandAnsUuid(
        request,
        questionBankUuid,
        cpToken
      );
      qandA.push(eachQA);
    }
    logger.info(qandA);
    //Hit submit challenge API for each question from questionArray
    for (let element of questionArray) {
      let answer,
        newanswer,
        index = 1;
      for (let object of qandA) {
        for (let j = 0; j < object.length; j++) {
          // Check if the questionUuid matches the targetQuestionUuid
          if (element.questionuuid === object[j].questionUuid) {
            answer = object[j].finalAnswersTxt;
            newanswer = answer.replace(/\\"/g, '"');
            logger.info(newanswer);
            let response = await submitChallengeApi(
              request,
              "134ce46f-803f-49b8-b5d8-d7c7b5939158",
              object[0].questionUuid,
              element.questionType,
              element.challengeuuid,
              element.questionPosition,
              newanswer,
              learnerToken
            );
            logger.info(JSON.stringify(response));
            break;
          }
          // else {
          //   let response = await submitChallengeApi(request, '1593dc39-edc2-4dba-b7fa-aeff627942a1', object[0].questionUuid, element.questionType, element.challengeuuid, element.questionPosition, "null", learnerToken);
          //   logger.info(JSON.stringify(response));
          //   index++

          // }
        }
      }
    }
  });

  test.skip("Complete Test", async ({ request }, testInfo) => {
    testInfo.setTimeout(400000);
    let response = await createTestApi(
      request,
      learnerToken,
      "89866cdd-0988-47e9-83ed-824ef123e3ba",
      "2935d049-2dc5-459e-b209-605c5a286c79"
    );
    console.log(JSON.stringify(response));
    let qandaArray = [];
    qestionsArray = [];
    let questionObj = response[0].data.createAssessmentChallenge.questions;
    for (let i = 0; i < questionObj.length; i++) {
      let question = questionObj[i].questionUuid;
      let type = questionObj[i].questionType;
      let challengeuuid = questionObj[i].challengeUuid;
      let position = questionObj[i].position;
      qestionsArray.push({
        challengeid: challengeuuid,
        questionuuid: question,
        questionType: type,
        position: position,
      });
    }
    console.log(qestionsArray);

    let respofQA = await getCourseQandAApi(
      request,
      cpToken,
      "2935d049-2dc5-459e-b209-605c5a286c79"
    );
    let videosObj = respofQA.assessmentTabData.videos;
    for (let element of videosObj) {
      try {
        if (element.assessmentQuestions[0].questionUuid !== undefined) {
          let assessmentQuestionsObj = element.assessmentQuestions;
          for (let obj of assessmentQuestionsObj) {
            let answerArray = [];
            let question = await obj.questionUuid;
            console.log(question);
            let type = obj.questionType;
            let answers = obj.answers;
            let matchingAnswers = obj.targets;
            if ((obj.questionType = "MULTIPLE_CHOICE")) {
              for (let obj of answers) {
                if (obj.correct === true) {
                  let answer = obj.uuid;
                  answerArray.push(answer);
                }
              }
            }
            if ((obj.questionType = "MATCHING")) {
              for (let element of matchingAnswers) {
                let subAnswerArry = [];
                let subQuestionUuid = element.uuid;
                let subAnswer = element.matches[0];
                subAnswerArry.push(subAnswer);
                let finalAnswersTxt = JSON.stringify(
                  `"${subQuestionUuid}":["${subAnswerArry}"]`
                )
                  .replace(/\\"/g, '"')
                  .slice(1, -1);
                console.log(finalAnswersTxt);
                answerArray.push(finalAnswersTxt);
              }
            }
            qandaArray.push({
              questionuuid: question,
              questionType: type.toLowerCase(),
              answer: answerArray,
            });
          }
        }
      } catch {
        console.log("unable to extract QA");
      }
    }
    console.log(qandaArray);
    for (let obj of qestionsArray) {
      let answer, newanswer;
      console.log(obj);
      for (let elements of qandaArray) {
        if (
          obj.questionuuid === elements.questionuuid &&
          obj.questionType == "multiple_choice"
        ) {
          answer = JSON.stringify(elements.answer);
          newanswer = answer.replace(/\\"/g, '"');
          console.log(newanswer);
          let response = await submitChallengeApi(
            request,
            "eabd95c3-beab-40a7-9229-e5d968afc3bf",
            obj.questionuuid,
            obj.questionType,
            obj.challengeid,
            obj.position,
            newanswer,
            learnerToken
          );
          logger.info(JSON.stringify(response));
        }
        if (
          obj.questionuuid === elements.questionuuid &&
          obj.questionType == "matching"
        ) {
          answer = JSON.stringify(elements.answer);
          newanswer = answer
            .replace(/\\"/g, '"')
            .replace(/",/g, ",")
            .replace(/""/g, '"')
            .slice(1, -2);
          console.log(newanswer);
          let response = await submitChallengeApi(
            request,
            "eabd95c3-beab-40a7-9229-e5d968afc3bf",
            obj.questionuuid,
            obj.questionType,
            obj.challengeid,
            obj.position,
            newanswer,
            learnerToken
          );
          logger.info(JSON.stringify(response));
        }
      }
    }
  });

  test.skip("Skill BM extract QA", async ({ request }, testInfo) => {
    testInfo.setTimeout(400000);
    let learnerToken = `eyJraWQiOiI4XC9OUTZ1TnRieGRLaFh0a3ViQVd0dFBGWnZPbTV0Qm5lM0FhY1YyOXNOND0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiSE5naVpQRVRNVXktcEJKMm5kR3pSdyIsInN1YiI6ImZhMzk1N2U2LWZiOWQtNGIwYS1iZDUyLTlmMDNiYWNlOGU4MSIsImNvZ25pdG86Z3JvdXBzIjpbInVzLWVhc3QtMV92NlBrdEhOc3BfU2tpbGxzb2Z0LUFNUiJdLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImN1c3RvbTpvcmdhbml6YXRpb25faWQiOiI1MDM2MTYwOC1hYTIzLTQ5NGQtYTIzMy0yZmQxNGQ2YTAzZjQiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV92NlBrdEhOc3AiLCJjb2duaXRvOnVzZXJuYW1lIjoic2tpbGxzb2Z0LWFtcl9wYXJlZWtzaGl0aC52QHNraWxsc29mdC5jb20iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJQYXJlZWtzaGl0aC5WQHNraWxsc29mdC5jb20iLCJnaXZlbl9uYW1lIjoiUGFyZWVrc2hpdGgiLCJhdWQiOiIydGpzcGhhazVkNHJibzNhdjNyOHYwbnFnayIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IlBhcmVla3NoaXRoLlZAc2tpbGxzb2Z0LmNvbSIsInByb3ZpZGVyTmFtZSI6IlNraWxsc29mdC1BTVIiLCJwcm92aWRlclR5cGUiOiJTQU1MIiwiaXNzdWVyIjoiaHR0cHM6XC9cL3N0cy53aW5kb3dzLm5ldFwvNTAzNjE2MDgtYWEyMy00OTRkLWEyMzMtMmZkMTRkNmEwM2Y0XC8iLCJwcmltYXJ5IjoidHJ1ZSIsImRhdGVDcmVhdGVkIjoiMTcwNTkxMDEyODE5OCJ9XSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MDc3MTIyNTYsImV4cCI6MTcwNzcxOTQ1OSwiaWF0IjoxNzA3NzE1ODU5LCJmYW1pbHlfbmFtZSI6IlYiLCJlbWFpbCI6IlBhcmVla3NoaXRoLlZAc2tpbGxzb2Z0LmNvbSJ9.jWTXcX44rCM-G-kpGDqNaQWG08lXEMzvYwUdT0m8_pVtc3mFt7D54B1I0nYQJfg2GnBv0wDDjfnlx-6lPPft1FI0sWUYNPRphL0riXULtLVJBesFFc8BvCKzyRIr8k440tm705MjsqqmoG_6ddr7kl_IBSZK0IQLEeXqVhZ0B-WEEBN37VXj7tn2DPDzRbb6GPXOpk5q3txPXsuFS0OkIAIvsF5AO6P-volUi1V76mtP9tN-xivlLPJTI5ljhx1lQmfZsLMMf8HDocvm_evO3zgYPKfJ_E_2Mdav5Xmm_6z41V0v2TZwnpnU9OWj5rdTf_scUphNKBemd4g5DcWfrQ`;
    let questionbanks = await getAllBMQuestionBanks(
      request,
      "8788d8d4-c244-4ede-ba6d-e88468f1c6ab",
      learnerToken
    );
    logger.info(questionbanks);
    let qandA = [];

    for (var i = 0; i < questionbanks.length; i++) {
      let questionBankUuid = await questionbanks[i].questionBankUuid;
      let eachQA = await getAllBMQuestionsandAnsUuid(
        request,
        questionBankUuid,
        learnerToken
      );
      qandA.push(eachQA);
    }
    //let jsonObject = JSON.stringify(qandA);
    logger.info(qandA);
    logger.info("END OF QA");
    logger.info(qandA[0][0].finalAnswersTxt);
    logger.info(qandA[1][0].finalAnswersTxt);
    logger.info(qandA[21][0].finalAnswersTxt);
  });

  test.skip("Cp login and extract QA", async ({ request }, testInfo) => {
    testInfo.setTimeout(40000);
    let videouuid = [];
    let matchingTypeQA = [];
    let multiChoiceTypeQA = [];

    videouuid = await courseuuidList(
      request,
      "09fb4f7e-48eb-4ebf-9d50-bd83f65e0aa8",
      cpToken
    );
    logger.info("List of videos in the course :" + videouuid);

    for (var i = 0; i < videouuid.length; i++) {
      let uuId = JSON.stringify(videouuid[i].uuid);
      let uuidWithoutQuotes = uuId.replace(/"/g, "");
      logger.info(uuidWithoutQuotes);
      let qandA = await extractMatchigTypeQAoneachuuid(
        request,
        uuidWithoutQuotes,
        cpToken
      );
      if (qandA.length > 0) {
        matchingTypeQA.push(qandA);
      }
    }
    for (var j = 0; j < videouuid.length; j++) {
      let uuId = JSON.stringify(videouuid[j].uuid);
      let uuidWithoutQuotes = uuId.replace(/"/g, "");
      logger.info(uuidWithoutQuotes);
      let multiChoice = await extractMultipleChoiceTypeQAoneachuuid(
        request,
        uuidWithoutQuotes,
        cpToken
      );
      if (multiChoice.length > 0) {
        multiChoiceTypeQA.push(multiChoice);
      }
    }
    logger.info(matchingTypeQA);

    logger.info("************** END OF MATCHING QA ****************");

    logger.info(multiChoiceTypeQA);
  });
});
