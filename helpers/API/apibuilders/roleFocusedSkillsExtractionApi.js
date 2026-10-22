import {
  headerData,
  userSkillsPayload,
  expect,
  logger,
  urlData,
} from "../../../path.js";

export async function roleFocusedSkillsExtractionApi(request, jwt, roleId) {
  try {
    let userFocusSkillsHeaders = headerData.userFocusSkillsHeaders(
      jwt,
      "application/json"
    );

    let res = await request.post(urlData.userFocusSkillsUrl, {
      headers: userFocusSkillsHeaders,
      data: userSkillsPayload(roleId),
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(`Skills has beed extracted for role id  ${roleId}`);
    return resp;
  } catch (e) {
    logger.error(
      `Failed to extract  skill for role id: ${roleId} due to error ${e} `
    );
  }
}
