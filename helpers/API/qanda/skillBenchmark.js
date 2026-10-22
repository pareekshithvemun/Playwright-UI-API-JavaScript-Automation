import { getBMQuestionBankApi } from "../../../helpers/API/apibuilders/getBMQuestionBank";
import { getBMQuestionsApi } from "../../../helpers/API/apibuilders/getBMQuestions";
let questionBankUuid;
export async function getAllBMQuestionBanks(request, benchMrkId, token) {
  let responseJson = await getBMQuestionBankApi(request, benchMrkId, token);

  let questionBankAry = await responseJson.questionBankTabData.questionBanks;
  let questionBankUuidAry = [];
  for (let i = 0; i < questionBankAry.length; i++) {
    questionBankUuid = await responseJson.questionBankTabData.questionBanks[i]
      .questionBankUuid;
    questionBankUuidAry.push({ questionBankUuid: questionBankUuid });
  }
  return questionBankUuidAry;
}

export async function getAllBMQuestions(request, uuid, token) {
  let response = await getBMQuestionsApi(request, uuid, token);
  let questionArr = await response.questionsTabData.questions;

  let qandaArr = [];

  for (let i = 0; i < questionArr.length; i++) {
    let answers = [];
    let subQuestionAndAnswers = [];
    let questionType = await questionArr[i].questionType;
    let question = await questionArr[i].stem.replace(
      /<\/?[^>]+(>|$)|&nbsp;/g,
      ""
    );
    if (questionType === "MULTIPLE_CHOICE") {
      let answersArr = await response.questionsTabData.questions[i].answers;
      for (let j = 0; j < answersArr.length; j++) {
        let answerBolean = await answersArr[j].correct;
        let answerText = await answersArr[j].text;
        if (answerBolean === true) {
          answers.push(answerText);
        }
      }
      let answersTxt = JSON.stringify(answers);
      let finalAnswersTxt = answersTxt.replace(/\\/g, "");
      qandaArr.push({ question: question, answer: finalAnswersTxt });
    }
    if (questionType === "MATCHING") {
      let targetsArr = await response.questionsTabData.questions[i].targets;
      let answersArr = await response.questionsTabData.questions[i].answers;
      for (let k = 0; k < targetsArr.length; k++) {
        let answersTextArr = [];
        let questionText = await targetsArr[k].text.replace(
          /<\/?[^>]+(>|$)|&nbsp;/g,
          ""
        );
        let answerText = await answersArr[k].text.replace(
          /<\/?[^>]+(>|$)|&nbsp;/g,
          ""
        );
        answersTextArr.push(questionText);
        subQuestionAndAnswers.push({
          question: answerText,
          answer: answersTextArr,
        });
      }

      let answersTxt = JSON.stringify(subQuestionAndAnswers);
      let finalAnswersTxt = answersTxt.replace(/<\/?[^>]+(>|$)|&nbsp;/g, "");
      qandaArr.push({
        question: question,
        subQuestionAndAnswers: finalAnswersTxt,
      });
    }
  }
  return qandaArr;
}

export async function getAllBMQuestionsandAnsUuid(request, uuid, token) {
  let response = await getBMQuestionsApi(request, uuid, token);

  let questionArr = await response.questionsTabData.questions;

  let qandaArr = [];

  for (let i = 0; i < questionArr.length; i++) {
    let answers = [];
    let subQuestionAndAnswers = [];
    let questionType = await questionArr[i].questionType;
    let questionUuid = await questionArr[i].questionUuid;
    if (questionType === "MULTIPLE_CHOICE") {
      let answersArr = await response.questionsTabData.questions[i].answers;
      for (let j = 0; j < answersArr.length; j++) {
        let answerBolean = await answersArr[j].correct;
        let answerUuid = await answersArr[j].uuid;
        if (answerBolean === true) {
          answers.push(answerUuid);
        }
      }
      let answerUuid = JSON.stringify(answers);
      let finalAnswersTxt = answerUuid.replace(/"/g, '\\"');
      qandaArr.push({ questionUuid, finalAnswersTxt });
    }
    if (questionType === "MATCHING") {
      let targetsArr = await response.questionsTabData.questions[i].targets;
      let answersArr = await response.questionsTabData.questions[i].answers;
      for (let k = 0; k < targetsArr.length; k++) {
        let answersTextArr = [];
        let questionText = await targetsArr[k].uuid;
        let answerText = await targetsArr[k].matches[0];
        answersTextArr.push(answerText);
        subQuestionAndAnswers.push({ questionText, answersTextArr });
      }

      let answersTxt = JSON.stringify(subQuestionAndAnswers);
      let finalAnswersTxt = answersTxt
        .replace(/<\/?[^>]+(>|$)|&nbsp;/g, "")
        .replace(/"questionText":/g, "")
        .replace(/"answersTextArr":/g, "")
        .replace(/\[{|}\]/g, "")
        .replace(/"/g, '\\"')
        .replace(/[{}}]/g, "")
        .replace(/",/g, '":')
      qandaArr.push({ questionUuid, finalAnswersTxt });
    }
    if (questionType === "RANKING") {
      let answersArr = await response.questionsTabData.questions[i].answers;
      let answersUuidArr = [];
      for (let l = 0; l < answersArr.length; l++) {
        let answerUuid = await answersArr[l].uuid;
        answersUuidArr.push(answerUuid);
      }
      let answersTxt = JSON.stringify(answersUuidArr);
      let finalAnswersTxt = answersTxt.replace(/"/g, '\\"');
      qandaArr.push({ questionUuid, finalAnswersTxt });
    }
  }
  return qandaArr;
}
