import {
  test,
  getAllLearningProgramsApi,
  deleteLearningProgramApi,
  archiveLearningProgramApi,
  generateToken,
  logger,
} from "../../../path.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all Learning Programs", async ({ request }, testInfo) => {
  testInfo.setTimeout(400000);
  let LearningProgramData = await getAllLearningProgramsApi(request, jwt);
  let draftProgramUuids = [];
  let inProgressStateProgramUuids = [];
  LearningProgramData.data.learningPrograms.forEach((program) => {
    if (program.status === "draft") {
      draftProgramUuids.push(program.learningProgramUuid);
    } else if (program.status === "in_progress") {
      inProgressStateProgramUuids.push(program.learningProgramUuid);
    }
  });
  logger.info(`Draft Program UUIDs: ${draftProgramUuids}`);
  logger.info(`Inprogress Program UUIDs:" ${inProgressStateProgramUuids}`);
  for (let lpid of draftProgramUuids) {
    await deleteLearningProgramApi(request, jwt, lpid);
  }
  for (let lpid of inProgressStateProgramUuids) {
    await archiveLearningProgramApi(request, jwt, lpid);
  }
});
