import {
  expect,
  headerData,
  urlData,
  logger,
  createOrgUserWithAttributesPayload,
} from "../../../path.js";

export async function createOrgUserWithAttributesApi(
  request,
  jwt,
  {
    firstName,
    lastName,
    email,
    password,
    roleUuid,
    role,
    customAttributes = [],
  },
) {
  try {
    const response = await request.post(urlData.createUserUrl, {
      data: createOrgUserWithAttributesPayload({
        firstName,
        lastName,
        email,
        password,
        roleUuid,
        role,
        customAttributes,
      }),
      headers: headerData.createUserHeader(jwt, "application/json"),
    });
    if (response.status() !== 200) {
      const errorText = await response.text();
      logger.error(
        `Create user failed for ${email} (${response.status()}): ${errorText.slice(0, 500)}`,
      );
      expect(response.status()).toBe(200);
    }
    const responseData = await response.json();
    logger.info(`Created user ${firstName} ${lastName} (${email})`);
    return { success: true, id: responseData.id, response: responseData };
  } catch (error) {
    logger.error(`Create user error for ${email}: ${error.message}`);
    throw error;
  }
}
