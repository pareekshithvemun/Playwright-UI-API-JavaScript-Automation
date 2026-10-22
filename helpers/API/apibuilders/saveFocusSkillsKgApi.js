import {
  headerData,
  urlData,
  saveFocusSkillsKgPayload,
  expect,
  logger,
} from "../../../path.js";

export async function saveFocusSkillsKgApi(request, jwt, jobRoleId, skillIds, roleName, loginName) {
  try {
    const response = await request.post(urlData.saveFocusSkillsKgUrl, {
      data: saveFocusSkillsKgPayload(jobRoleId, skillIds),
      headers: headerData.getPrimaryJobRolesHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errors = body?.[0]?.errors || body?.errors || [];
    if (errors.length) {
      throw new Error(errors.map((error) => error.message).join("; "));
    }
    logger.info(`Saved ${skillIds.length} focus skills | ${roleName} | ${loginName}`);
    return body;
  } catch (error) {
    logger.error(`Could not save focus skills for ${roleName} on ${loginName}: ${error.message}`);
    throw error;
  }
}
