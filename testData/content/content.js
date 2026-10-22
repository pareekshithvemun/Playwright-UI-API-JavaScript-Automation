import { answersOfCompTIAServerDataPrivacyProtection } from "../quesandAnswers/CompTIAServerDataPrivacyProtection";
import { ReimaginingWorkwithGenerativeAIBenchMark } from "../quesandAnswers/ReimaginingWorkwithGenerativeAIBenchMark";
import { SecOpsAwarenessEntryLevel } from "../quesandAnswers/SecOpsAwarenessEntryLevel";
import { SecurityThreatIntelligenceCompetencyIntermediateLevel } from "../quesandAnswers/SecurityThreatIntelligenceCompetencyIntermediateLevel";
import { CloudArchitectLiteracyBeginnerLevel } from "../quesandAnswers/CloudArchitectLiteracyBeginnerLevel";
import { AWSCloudAwarenessEntryLevel } from "../quesandAnswers/AWSCloudAwarenessEntryLevel";
import { AzureCloudAwarenessEntryLevel } from "../quesandAnswers/AzureCloudAwarenessEntryLevel";
import { GCPCloudAwarenessEntryLevel } from "../quesandAnswers/GCPCloudAwarenessEntryLevel";
import { DevSecOpsLiteracyBeginnerLevel } from "../quesandAnswers/DevSecOpsLiteracyBeginnerLevel";
import { FosteringAGrowthMindsetInTheAgeOfAI } from "../quesandAnswers/FosteringAGrowthMindsetInTheAgeOfAI";
import { ProvenTechniquesforTechnicalCommunication } from "../quesandAnswers/ProvenTechniquesforTechnicalCommunication";
import { SecurityLiteracyBeginner } from "../quesandAnswers/SecurityLiteracyBeginner";
import { OralCommunication } from "../quesandAnswers/OralCommunication";
import reusableFunctions from "../../helpers/UI/commonFunctions.js";
import { logger } from "../../logger.js";

let fileName = process.env.FileName;
let areaDataFilepath = reusableFunctions.getPath(
  "testData/AreaTestData",
  `${fileName}.json`,
);
let areaData = reusableFunctions.readDatafromJsonFilenotasync(areaDataFilepath);
let totalData = areaData?.testData;

export const CONTENT = {
  book: {
    id: "6c18c970-c4e8-11e7-9233-92959924aa1c",
    title: "Derivatives Markets and Analysis",
  },
  course: {
    id: "7ed0de37-784d-4e35-9012-6b0bba7094b9",
    title: "Customer Service: Engaging with Customers",
  },
  ccvideo: {
    id: "56262c27-fea5-11e6-8638-0242c0a80b06",
    title: "Aligning Project Goals to Corporate Strategy",
  },
  course1: {
    id: "56287611-fea5-11e6-8638-0242c0a80b06",
    title: "Interacting with Customers",
  },
  SkillBenchMark: [
    {
      id: "6936aa1f-fbf8-4a7b-aab8-f5f1b17ef6a8",
      title: "Reimagining Work with Generative AI",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark:
        ReimaginingWorkwithGenerativeAIBenchMark.answersOfBenchMark,
    },
    {
      id: "050de5b4-1c73-48a5-8248-adea2690acc3",
      title: "Oral Communication",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: OralCommunication.answersOfBenchMark,
    },
    {
      id: "12a7ae30-a3d4-4066-bd20-6030ef68cc9a",
      title: "Security Threat Intelligence Competency (Intermediate Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark:
        SecurityThreatIntelligenceCompetencyIntermediateLevel.answersOfBenchMark,
    },
    {
      id: "8a21d831-4ab2-429a-86dd-395fbd914cb8",
      title: "SecOps Awareness (Entry Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: SecOpsAwarenessEntryLevel.answersOfBenchMark,
    },
    {
      id: "4dd31d02-6097-46e8-ae05-e13fb52f3238",
      title: "Security Literacy (Beginner)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: SecurityLiteracyBeginner.answersOfBenchMark,
    },
    {
      id: "0068de5f-b9ae-4431-969e-6aaaf2d988cf",
      title: "DevSecOps Literacy (Beginner Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: DevSecOpsLiteracyBeginnerLevel.answersOfBenchMark,
    },
    {
      id: "d033642e-0efb-4a08-aadf-bfeaa9e62fa1",
      title: "GCP Cloud Awareness (Entry Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: GCPCloudAwarenessEntryLevel.answersOfBenchMark,
    },
    {
      id: "e85d9f18-2c67-4290-a70f-5faa7a61621a",
      title: "Azure Cloud Awareness (Entry Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: AzureCloudAwarenessEntryLevel.answersOfBenchMark,
    },
    {
      id: "5f589403-5f20-48d2-8155-748bc88be933",
      title: "AWS Cloud Awareness (Entry Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark: AWSCloudAwarenessEntryLevel.answersOfBenchMark,
    },
    {
      id: "f9c69450-4a1e-4324-ad43-0380e7c41e63",
      title: "Cloud Architect Literacy (Beginner Level)",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark:
        CloudArchitectLiteracyBeginnerLevel.answersOfBenchMark,
    },
    {
      id: "6936aa1f-fbf8-4a7b-aab8-f5f1b17ef6a8",
      title: "Reimagining Work with Generative AI",
      contentType: "SKILL BENCHMARK",
      answersOfBenchMark:
        ReimaginingWorkwithGenerativeAIBenchMark.answersOfBenchMark,
    },
  ],
  courses: [
    {
      id: "5ced2b2b-7ac8-4fae-a482-2903b373ccc3",
      title: "CompTIA Server+: Data Privacy & Protection",
      contentType: "COURSE",
      answersOfCourse:
        answersOfCompTIAServerDataPrivacyProtection.answersOfCourse,
    },
    {
      id: "8c25498f-b24d-4087-bdcb-c1509a5c1d86",
      title: "Proven Techniques for Technical Communication",
      contentType: "COURSE",
      answersOfCourse:
        ProvenTechniquesforTechnicalCommunication.answersOfCourse,
    },

    // {
    //   id: "78e04f73-24d1-4d7e-bfe7-ca79de73be85",
    //   title: "Fostering a Growth Mindset in the Age of AI",
    //   contentType: "COURSE",
    //   answersOfCourse: FosteringAGrowthMindsetInTheAgeOfAI.answersOfCourse,
    // },
  ],
};

// export async function getskillID() {
//   let assessmentData = {};
//   totalData.forEach((area) => {
//     area.Subjects.forEach((subject) => {
//       if (subject.CustomJournies) {
//         subject.CustomJournies.forEach((journey) => {
//           journey.Tracks.forEach((track) => {
//             track.trackContent.forEach((content) => {
//               if (content.contentItemType === "ASSESSMENT") {
//                 if (!assessmentData[journey.JourneyName]) {
//                   assessmentData[journey.JourneyName] = [];
//                 }
//                 assessmentData[journey.JourneyName].push(
//                   content.contentItemUuid
//                 );
//               }
//             });
//           });
//           console.log(journey.JourneyName);
//           console.log(assessmentData[journey.JourneyName]);
//         });
//       }
//     });
//   });
// }

export async function getskillID(number) {
  let assessmentData = {};
  let journeyNames = [
    "Cloud Platform Fundamentals Journey",
    "AI Fundamentals Journey",
    "Cybersecurity Journey",
    "DEVOPS Foundations Journey",
    "New Leader/ First Time Manager Journey",
    "Leader of Leaders Journey",
    "Mid-level Management Journey",
    "Leading a Business Transformation Journey",
    // 'DEI Custom Journey',
    "Onboarding Software Engineer Custom Journey",
    "Onboarding Retail Employee Custom Journey",
    "Onboarding Sales Associate Custom Journey",
  ];

  journeyNames.forEach((journeyName) => {
    totalData.forEach((area) => {
      area.Subjects.forEach((subject) => {
        if (subject.CustomJournies) {
          subject.CustomJournies.forEach((journey) => {
            if (journey.JourneyName === journeyName) {
              journey.Tracks.forEach((track) => {
                track.trackContent.forEach((content) => {
                  if (content.contentItemType === "ASSESSMENT") {
                    if (!assessmentData[journeyName]) {
                      assessmentData[journeyName] = new Set();
                    }
                    assessmentData[journeyName].add(content.contentItemUuid);
                  }
                });
              });
            }
          });
        }
      });
    });
  });

  const uniqueBenchmarks = new Set();
  for (const journeyName of journeyNames) {
    let benchmarks = assessmentData[journeyName];
    const arrayFromSet = Array.from(benchmarks ?? []); // converting set object to array
    let shuffledData = reusableFunctions.shuffleDataInArray(arrayFromSet); //shuffling element in array
    const selectedBenchmarks = Array.from(shuffledData).slice(0, number); //slicing the array
    selectedBenchmarks.forEach((benchmark) => uniqueBenchmarks.add(benchmark));
  }
  const uniqueBenchmarkArray = Array.from(uniqueBenchmarks);
  return uniqueBenchmarkArray;
}
