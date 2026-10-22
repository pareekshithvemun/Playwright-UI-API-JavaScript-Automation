import { reusableFunctions, headerData, urlData, contentevalHirePayload, logger } from "../../../path.js";
import { parseFirstLastFromEmail } from "./percipiodemoHireSwapApi.js";

export async function fetchRoleUuid(request, jwt, roleName) {
  let host = reusableFunctions.orgHostname();
  try {
    let res = await request.get(urlData.getRolePrivilegesUrl(), {
      headers: headerData.getAllUsersHeaders(jwt, "application/json"),
    });
    if (res.status() !== 200) {
      logger.error(`[${host}] fetch roles failed (${res.status()})`);
      return null;
    }
    let body = await res.json();
    let allRoles = [...(body.stockCustomizableRoles || []), ...(body.customRoles || [])];
    let match = allRoles.find((r) => r.roleName.toLowerCase() === roleName.toLowerCase());
    if (!match) {
      logger.error(`[${host}] role "${roleName}" not found`);
      return null;
    }
    logger.info(`[${host}] found role "${roleName}" → ${match.roleUuid}`);
    return match.roleUuid;
  } catch (error) {
    logger.error(`[${host}] fetchRoleUuid error: ${error.message}`);
    return null;
  }
}

export async function createContentevalHireUser(request, jwt, hireEmail, password, roleUuid) {
  let host = reusableFunctions.orgHostname();
  let { firstName, lastName } = parseFirstLastFromEmail(hireEmail);
  let body = contentevalHirePayload({ firstName, lastName, email: hireEmail, password, roleUuid });

  let res = await request.post(urlData.createUserUrl, {
    data: body,
    headers: headerData.createUserHeader(jwt, "application/json"),
  });

  if (res.status() !== 200) {
    let text = await res.text();
    logger.error(`[${host}] create user failed (${res.status()}) ${hireEmail}: ${text.slice(0, 800)}`);
    return;
  }

  let resp = await res.json();
  logger.info(`[${host}] user created: ${hireEmail} → ${resp.id}`);
}
