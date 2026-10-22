import {
  expect,
  headerData,
  urlData,
  logger,
  updateUserWithCustomAttributesPayload,
} from "../../../path.js";

export async function updateUserWithCustomAttributesApi(
  request,
  jwt,
  userId,
  externalId,
  customAttributeId,
  attributeValue,
) {
  try {
    const response = await request.put(urlData.ediAdminUserUrl(userId), {
      data: updateUserWithCustomAttributesPayload(
        externalId,
        customAttributeId,
        attributeValue,
      ),
      headers: headerData.editAdminUserHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    return { success: true, response: await response.json() };
  } catch (error) {
    logger.error(`Failed to update user ${userId}: ${error.message}`);
    return { success: false };
  }
}
