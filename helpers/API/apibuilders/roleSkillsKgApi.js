import {
  headerData,
  urlData,
  roleSkillsKgPayload,
  expect,
  logger,
} from "../../../path.js";

export async function roleSkillsKgApi(request, jwt, jobRoleId, roleName) {
  try {
    const response = await request.post(urlData.roleSkillsKgUrl, {
      data: roleSkillsKgPayload(jobRoleId),
      headers: headerData.getPrimaryJobRolesHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errors = body?.[0]?.errors || body?.errors || [];
    if (errors.length) {
      throw new Error(errors.map((error) => error.message).join("; "));
    }
    const skills = body?.[0]?.data?.skilzRoleSkillsWithUserRating?.skills || [];
    logger.info(`Loaded ${skills.length} skills for ${roleName}`);
    return skills;
  } catch (error) {
    logger.error(`Could not load skills for ${roleName}: ${error.message}`);
    throw error;
  }
}
