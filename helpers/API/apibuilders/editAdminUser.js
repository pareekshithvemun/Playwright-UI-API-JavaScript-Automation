import {
  expect,
  headerData,
  urlData,
  logger,
  editAdminUserPayload,
} from "../../../path.js";

export async function editAdminUser(request, jwt, userId, customAttributeId) {
  try {
    let headersOfeditAdminUser = headerData.editAdminUserHeaders(jwt);
    let respofeditAdminUser = await request.put(
      urlData.ediAdminUserUrl(userId),
      {
        data: editAdminUserPayload(customAttributeId),
        headers: headersOfeditAdminUser,
      }
    );
    expect(respofeditAdminUser.status()).toBe(200);
    logger.info(`Added Admin user ${userId}  to region audience`);
  } catch (error) {
    logger.error(
      `Unable to add Admin user ${userId} to region audience due to error: ${error}`
    );
  }
}
