import {
  headerData,
  expect,
  urlData,
  logger,
  updateLearningProgramPayload,
  reusableFunctions,
} from "../../../path.js";

export async function createLearningProgramApi(
  request,
  jwt,
  lptitle,
  lpdescription,
  lpgoal,
  lpbusinessObjectiveUuid,
  isContentOrderRequired,
  lpstartDate,
  lpcategory,
  lpcontents,
  adminId,
  cohortname,
  audienceUuids,
  lpenrollmentType,
  msteamsRedirectUrl,
  lpaction
) {
  let cohortUuid = reusableFunctions.uuidGenerator();
  try {
    let createLearningProgramHeader = headerData.createLearningProgramHeaders(
      jwt,
      "application/json"
    );

    let res = await request.post(urlData.createLearningProgramUrl, {
      data: await updateLearningProgramPayload({
        lptitle,
        lpdescription,
        lpgoal,
        lpbusinessObjectiveUuid,
        isContentOrderRequired,
        lpstartDate,
        lpcategory,
        lpcontents,
        cohortUuid,
        adminId,
        cohortname,
        audienceUuids,
        lpenrollmentType,
        msteamsRedirectUrl,
        lpaction,
      }),
      headers: createLearningProgramHeader,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(
      `${lptitle} learning program created with cohortId ${cohortUuid}`
    );
  } catch (e) {
    logger.error(
      `Failed to create learning program ${lptitle} due to an error:${e}`
    );
  }
}
