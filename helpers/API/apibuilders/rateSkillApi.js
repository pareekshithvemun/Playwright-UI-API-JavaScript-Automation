import {
  headerData,
  rateSkillPayload,
  expect,
  logger,
  urlData,
} from "../../../path.js";

export async function rateSkillApi(request, jwt, skill_id, rating) {
  try {
    let rateSkillHeaders = headerData.rateSkillHeaders(jwt, "application/json");
    let res = await request.post(urlData.rateSkillUrl, {
      headers: rateSkillHeaders,
      data: rateSkillPayload(skill_id, rating),
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(`${skill_id} Skill has beed rated with rating ${rating} `);
    return resp;
  } catch (e) {
    logger.error(`Failed to rate skill ${skill_id} due to error ${e} `);
  }
}
