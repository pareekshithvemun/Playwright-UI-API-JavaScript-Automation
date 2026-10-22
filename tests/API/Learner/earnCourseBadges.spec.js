import { test } from "@playwright/test";
import { courseuuidList, extractMatchigTypeQAoneachuuid, extractMultipleChoiceTypeQAoneachuuid } from '../../../helpers/API/qanda/getCourseList.js';
import { getAllBMQuestionBanks, getAllBMQuestions, getAllBMQuestionsandAnsUuid } from '../../../helpers/API/qanda/skillBenchmark.js';
import { createSBAssessmentApi } from "../../../helpers/API/apibuilders/createSBAssessment.js"
import { generateTokenLearner } from "../../../helpers/API/token/tokenGeneratorLearner.js";
import { submitChallengeApi } from '../../../helpers/API/apibuilders/submitBMChallenge.js';
import { logger } from "../../../logger.js";
import { cpLoginPage } from '../../../pageObjects/cpLoginPage.js';
import { createTestApi } from "../../../helpers/API/apibuilders/createTestApi.js";
import { getCourseQandAApi } from "../../../helpers/API/apibuilders/getCourseQandAApi.js"
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getvideoIdFromCourseIdApi } from "../../../helpers/API/apibuilders/getvideoIdFromCourseId.js";



let learnerToken, cpToken, cpLoginPageObj, qestionsArray, answer, newanswer, courseData;
let page;
let pathofCourseData = "testData/courseCompletion/earnCourseBadges.json";
courseData = reusableFunctions.readDatafromJsonFilenotasync(pathofCourseData)


test.beforeAll("get cpToken", async ({ browser }, testInfo) => {
    testInfo.setTimeout(1000000);
    page = await browser.newPage();
    cpLoginPageObj = new cpLoginPage(browser,page);
    cpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage()
});
test.describe("Course completion got default users", async () => {
    test.describe.configure({ mode: "parallel" });
    for (let obj of courseData.coursesData) {
        let courseId = obj.courseId;
        test(`Course completion badges ${courseId}`, async ({ request }, testInfo) => {
            testInfo.setTimeout(1500000);
            let pathofUserData = "testData/usersData/defaultUsers.json";
            let userData = reusableFunctions.readDatafromJsonFilenotasync(pathofUserData);

            let respofQA = await getCourseQandAApi(request, cpToken, obj.courseId)
            let videosObj = respofQA.assessmentTabData.videos
            let qandaArray = [];
            for (let element of videosObj) {
                try {
                    if (element.assessmentQuestions[0].questionUuid !== undefined) {
                        let assessmentQuestionsObj = element.assessmentQuestions
                        for (let obj of assessmentQuestionsObj) {
                            let answerArray = [];
                            let question = await obj.questionUuid
                            logger.info(question)
                            let type = obj.questionType
                            let answers = obj.answers
                            let matchingAnswers = obj.targets
                            if (obj.questionType = "MULTIPLE_CHOICE") {
                                for (let obj of answers) {
                                    if (obj.correct === true) {
                                        let answer = obj.uuid
                                        answerArray.push(answer)
                                    }
                                }
                            }
                            if (obj.questionType = "MATCHING") {
                                for (let element of matchingAnswers) {
                                    let subAnswerArry = [];
                                    let subQuestionUuid = element.uuid
                                    let subAnswer = element.matches[0]
                                    subAnswerArry.push(subAnswer)
                                    let finalAnswersTxt = JSON.stringify(`"${subQuestionUuid}":["${subAnswerArry}"]`).replace(/\\"/g, '"').slice(1, -1)
                                    logger.info(finalAnswersTxt)
                                    answerArray.push(finalAnswersTxt)
                                }

                            }
                            qandaArray.push({ questionuuid: question, questionType: type.toLowerCase(), answer: answerArray })

                        }
                    }
                }
                catch { logger.info("unable to extract QA") }
            }
            logger.info(qandaArray)
            for (let att of userData.defaultUsersData) {
                try {
                    learnerToken = await generateTokenLearner(request, att.loginName, att.passWord);
                    let assesmentIdResp = await getvideoIdFromCourseIdApi(request, learnerToken, obj.courseId)
                    let assesmentId = assesmentIdResp[0].data.courseWithLT.assessmentTestId
                    let response = await createTestApi(request, learnerToken, assesmentId, obj.courseId);
                    qestionsArray = [];
                    let questionObj = response[0].data.createAssessmentChallenge.questions;
                    for (let i = 0; i < questionObj.length; i++) {
                        let question = questionObj[i].questionUuid
                        let type = questionObj[i].questionType
                        let challengeuuid = questionObj[i].challengeUuid
                        let position = questionObj[i].position
                        qestionsArray.push({ challengeid: challengeuuid, questionuuid: question, questionType: type, position: position })
                    }
                    logger.info(qestionsArray);


                    for (let obj of qestionsArray) {
                        let answer, newanswer;
                        logger.info(obj);
                        for (let elements of qandaArray) {
                            if (obj.questionuuid === elements.questionuuid && obj.questionType == "multiple_choice") {
                                answer = JSON.stringify(elements.answer);
                                newanswer = answer.replace(/\\"/g, '"')
                                logger.info(newanswer)
                                let response = await submitChallengeApi(request, "eabd95c3-beab-40a7-9229-e5d968afc3bf", obj.questionuuid, obj.questionType, obj.challengeid, obj.position, newanswer, learnerToken);
                                logger.info(JSON.stringify(response));
                            }
                            if (obj.questionuuid === elements.questionuuid && obj.questionType == "matching") {
                                answer = JSON.stringify(elements.answer);
                                newanswer = answer.replace(/\\"/g, '"').replace(/",/g, ',').replace(/""/g, '"').slice(1, -2);
                                logger.info(newanswer)
                                let response = await submitChallengeApi(request, "eabd95c3-beab-40a7-9229-e5d968afc3bf", obj.questionuuid, obj.questionType, obj.challengeid, obj.position, newanswer, learnerToken);
                                logger.info(JSON.stringify(response));
                            }

                        }
                    }
                    logger.info(`course completed successfully for user ${att.loginName} and courseId ${obj.courseId}`)

                }
                catch (error) {
                    logger.info(`course completion failed for user ${att.loginName} and courseId ${obj.courseId}`)
                }

            }
        }

        );
    }
});