import {
  expect,
  headerData,
  urlData,
  logger,
  setDirectManagerPayload,
} from "../../../path.js";

export async function setDirectManagerApi(
  request,
  jwt,
  learnerUserId,
  managerUserId,
) {
  try {
    let response = await request.put(urlData.ediAdminUserUrl(learnerUserId), {
      data: setDirectManagerPayload(managerUserId),
      headers: headerData.editAdminUserHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    let responseData = await response.json();
    logger.info(
      `Set learner ${learnerUserId} direct manager to ${managerUserId}`,
    );
    return { success: true, response: responseData };
  } catch (error) {
    logger.error(`Failed to set direct manager: ${error.message}`);
    throw error;
  }
}
