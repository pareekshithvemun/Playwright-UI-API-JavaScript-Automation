import {
  reusableFunctions,
  logger,
  findUserByEmailOrExternalId,
  putUserActiveInOrg,
} from "../../../path.js";

/** Hire row: user missing → createNewUser(); active → skip; inactive → reactivate. */
export async function hireFromSheetRow(request, jwt, hireEmail, createNewUser, password) {
  let host = reusableFunctions.orgHostname();
  let email = String(hireEmail ?? "").trim();
  if (!email) {
    logger.warn(`[${host}] hire SKIP — empty email`);
    return;
  }

  let user = await findUserByEmailOrExternalId(request, jwt, email);
  if (!user) {
    await createNewUser();
    return;
  }

  let status = String(user.status ?? "").trim().toLowerCase();
  if (status === "active") {
    logger.info(`[${host}] hire SKIP — already active | ${email}`);
    return;
  }

  if (status === "inactive") {
    await putUserActiveInOrg(
      request,
      jwt,
      user,
      `rehire OK — reactivated (must reset password on first login) | ${email}`,
      password,
    );
    return;
  }

  logger.warn(`[${host}] hire SKIP — unknown status "${user.status}" | ${email}`);
}
