import {
  reusableFunctions,
  headerData,
  urlData,
  percipiodemoHireSwapPutBody,
  logger,
  findUserByEmailOrExternalId,
} from "../../../path.js";

export function buildPercipiodemoPlaceholderEmail(index) {
  let start = parseInt(process.env.newusernumberForpercipiodemo || "101", 10);
  let domain = "skillsoft.com";
  return `newuser_${start + index}@${domain}`;
}

export function parseFirstLastFromEmail(email) {
  let local = (email.split("@")[0] || "").trim();
  let parts = local.split(".");
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }
  return { firstName: local || "User", lastName: "User" };
}

export async function swapPercipiodemoPlaceholderToHire(
  request,
  jwt,
  oldUserEmail,
  hireEmail,
  password,
) {
  let host = reusableFunctions.orgHostname();

  let oldUser = await findUserByEmailOrExternalId(request, jwt, oldUserEmail);
  if (!oldUser) {
    logger.error(`[${host}] pool user not found: ${oldUserEmail}`);
    return;
  }

  let existingExternalId =
    oldUser.externalId || oldUser.email || oldUser.loginName;
  let { firstName, lastName } = parseFirstLastFromEmail(hireEmail);

  let body = percipiodemoHireSwapPutBody({
    existingExternalId,
    hireEmail,
    firstName,
    lastName,
    password,
  });

  let res = await request.put(urlData.ediAdminUserUrl(oldUser.id), {
    data: body,
    headers: headerData.editAdminUserHeaders(jwt, "application/json"),
  });

  if (res.status() !== 200) {
    let text = await res.text();
    logger.error(
      `[${host}] hire swap failed (${res.status()}) ${oldUserEmail} to ${hireEmail}: ${text.slice(0, 800)}`,
    );
    return;
  }

  logger.info(
    `hire swap successfully completed in org: [${host}] from ${oldUserEmail} to ${hireEmail}`,
  );
}
