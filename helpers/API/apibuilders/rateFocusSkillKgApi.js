import {
  headerData,
  urlData,
  rateFocusSkillKgPayload,
  expect,
  logger,
} from "../../../path.js";

export async function rateFocusSkillKgApi(request, jwt, skillId, rating, skillName, loginName) {
  try {
    const response = await request.post(urlData.rateFocusSkillKgUrl, {
      data: rateFocusSkillKgPayload(skillId, rating),
      headers: headerData.getPrimaryJobRolesHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errors = body?.[0]?.errors || body?.errors || [];
    if (errors.length) {
      throw new Error(errors.map((error) => error.message).join("; "));
    }
    logger.info(`Rated ${skillName} at ${rating} | ${loginName}`);
    return body;
  } catch (error) {
    logger.error(`Could not rate ${skillName} for ${loginName}: ${error.message}`);
    throw error;
  }
}
