import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentSkillsPayload,
} from "../../../path.js";
// Update: Return only 1 id that matches the skill name (text argument)
export async function lxAssessmentSkillsApi(
  request,
  token,
  text,
  limit = 20,
  locale = "en-US"
) {
  try {
    let headers = headerData.lxAssessmentSkillsHeaders(token, "application/json");
    let payload = lxAssessmentSkillsPayload(text, limit, locale);

    let resp = await request.post(urlData.lxAssessmentSkillsUrl, {
      data: payload,
      headers: headers,
    });

    expect(resp.status()).toBe(200);
    let response = await resp.json();
    let skills = response.data?.skilzSearchOrgSkills || [];
    logger.info(`Found ${skills.length} skills matching "${text}"`);
    // Find the first skill whose name matches the text exactly
    let skill = skills.find(s => s.name === text);
    return skill ? skill.id : null;
  } catch (error) {
    logger.error(`Failed to search skills due to error: ${error}`);
    throw error;
  }
}