import {
  headerData,
  urlData,
  lxStudioAccessorPutPayload,
  logger,
  reusableFunctions,
} from "../../../path.js";

/** PUT is_lx_studio_accessor true for one UCM user id. */
export async function enableLxStudioAccessorApi(
  request,
  jwt,
  userId,
  externalId,
) {
  let host = reusableFunctions.orgHostname();
  let res = await request.put(urlData.ediAdminUserUrl(userId), {
    data: lxStudioAccessorPutPayload(externalId),
    headers: headerData.editAdminUserHeaders(jwt, "application/json"),
  });
  if (res.status() === 200) {
    logger.info(
      `[${host}] LX Studio accessor enabled | ${externalId} | id ${userId}`,
    );
    return true;
  }
  logger.error(
    `[${host}] LX Studio accessor FAIL HTTP ${res.status()} | ${externalId} | id ${userId}`,
  );
  return false;
}
