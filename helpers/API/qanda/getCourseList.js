import exp from "constants";
import {getCourseuuidListApi} from "../../../helpers/API/apibuilders/getAllUuidforCourse"
import {getQAforUuidApi} from "../../../helpers/API/apibuilders/getQAforUuid"
import { logger } from "../../../logger.js";



export async function courseuuidList(request,courseId,token){
    let course;
    
    let response = await getCourseuuidListApi(request,courseId,token);
    var courseList = await response.filesTabData.course.videoUuids;
   // const courseList = response.json().filesTabData.course.videoUuids;
    const videoList = [];
    courseList.forEach((course,index)=>{
    videoList.push({uuid: course});
    });

    logger.info(videoList);
    return videoList;
}

export async function extractMatchigTypeQAoneachuuid(request,uuid,token){
  let extractApiResponse = await getQAforUuidApi(request,uuid,token);
  let assessmentQuestions = await extractApiResponse.video.assessmentQuestions;
  logger.info(assessmentQuestions);
  
  
  let targetsArray = [];
  let answersArray = [];
  let subQuestionAndAnswers = [];
  let mainArray = [];
  for(let i =0;i<assessmentQuestions.length;i++){
  targetsArray = [];
  let questionType = await extractApiResponse.video.assessmentQuestions[i].questionType;
  logger.info(questionType);
if(questionType==='MATCHING'){
if(assessmentQuestions.length>0){
  

    const targets =  await extractApiResponse.video.assessmentQuestions[i].targets;
    await targets.forEach((target, index) => {
    targetsArray.push({question: target.text, answer: target.matches[0]});
    
});

}

else {
  logger.info("No Questions")
}

// logger.info("Array of targets with text and uuid:", targetsArray);
if(assessmentQuestions.length>0){
const answers =  await extractApiResponse.video.assessmentQuestions[i].answers;
await answers.forEach((answer, index) => {
    answersArray.push({uuid: answer.uuid, text: answer.text});
});
}
else {
  logger.info("No Answers")
}

// logger.info("Array of targets with text and uuid:", answersArray);
if(targetsArray.length>0){
for (let i = 0; i < targetsArray.length; i++) {
  let sourceUUID = targetsArray[i].answer;

// Find the matching object in the replacement array
  let replacementObject = answersArray.find(obj => obj.uuid === sourceUUID);

// If a matching object is found, update the text in the source array
  if (replacementObject) {
  targetsArray[i].answer = replacementObject.text;
}
}

//logger.info("Array of targets with Question and Answer:", targetsArray);
let mainQuestion = assessmentQuestions[i];
 subQuestionAndAnswers = targetsArray;
 if(targetsArray.length>0){
mainArray.push({question: mainQuestion.stem.replace(/<\/?p>/g, ''), subQuestionAndAnswers: JSON.stringify(subQuestionAndAnswers).replace(/"question"/g, 'question').replace( /"answer"/g, 'answer') });
 }
}
else{
  logger.info("No Questions in this section");

}
}
}
//return targetsArray;
if(mainArray){return mainArray;}
else{(logger.info("No questions found"))}

}


export async function extractMultipleChoiceTypeQAoneachuuid(request,uuid,token){
  let extractApiResponse = await getQAforUuidApi(request,uuid,token);
  let assessmentQuestions = await extractApiResponse.video.assessmentQuestions;
  let targetsArray = [];
  let answers = [];
  

  if(assessmentQuestions.length>0){
    let questionArr =  await extractApiResponse.video.assessmentQuestions;
    
 // await questionArr.forEach(async (question, index) => {
  for(let i =0;i<assessmentQuestions.length;i++){
    let questionType = await extractApiResponse.video.assessmentQuestions[i].questionType;
    logger.info(questionType);
    if(questionType==='MULTIPLE_CHOICE'){
      let answers = await extractAnswers(i);
      let question = questionArr[i];
      targetsArray.push({question: question.stem.replace(/<\/?p>/g, ''),  answers });
  }
}

}
//logger.info(targetsArray);
return targetsArray;


  async function extractAnswers(index) {
    let answers = [];
    let answersArr = await extractApiResponse.video.assessmentQuestions[index].answers;
    let correctBolean = await extractApiResponse.video.assessmentQuestions[index].answers;
    if (answersArr.length > 0) {

      for (let i = 0; i < answersArr.length; i++) {
        let boleanvalue = correctBolean[i].correct;
        if (boleanvalue === true) {
          logger.info(boleanvalue);
         answers.push( answersArr[i].text );
        }
      }
    }
    logger.info(answers);
    return JSON.stringify(answers);
  }


}

