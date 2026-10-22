/**
 * Deactivate users from hire/termination sheets (see deactivateOrAddUsers.spec.js + readTerminationList.js).
 * Flow: parse row → POST /api/ucm/users search → match candidate → PUT inactive.
 * Sheet email often ≠ UCM login; matching handles @skillsoft.com rows, first.last keys, and login local-part fallback.
 */

import {
  reusableFunctions,
  headerData,
  urlData,
  searchUserBody,
  inactiveUserPutBody,
  activeUserPutBody,
  logger,
} from "../../../path.js";

const SKILLSOFT_EMAIL_SUFFIX = "@skillsoft.com";

function collapseNamePart(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

// Full-email search: match email, loginName, or externalId.
function userMatchesEmailLikeSearch(user, searchLower) {
  let emailLower = String(user.email ?? "")
    .trim()
    .toLowerCase();
  let loginLower = String(user.loginName ?? "")
    .trim()
    .toLowerCase();
  let externalLower = String(user.externalId ?? "")
    .trim()
    .toLowerCase();
  return (
    emailLower === searchLower ||
    loginLower === searchLower ||
    externalLower === searchLower
  );
}

// "geoffrey.balester" from first.last@domain logins when UCM lastName is empty.
function identityLocalPart(value) {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  const at = s.indexOf("@");
  return at >= 0 ? s.slice(0, at) : s;
}

// No @ in search key: match UCM first+last, else email/login local part (e.g. Geoffrey.Balester@skillsoft.com).
function userMatchesFirstLastSearch(user, searchLower) {
  let parts = searchLower.split(".");
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return false;
  }

  if (
    collapseNamePart(user.firstName) === parts[0] &&
    collapseNamePart(user.lastName) === parts[1]
  ) {
    return true;
  }

  const locals = [
    identityLocalPart(user.email),
    identityLocalPart(user.loginName),
    identityLocalPart(user.externalId),
  ];
  return locals.some((local) => local === searchLower);
}

/**
 * POST /api/ucm/users search, then return first strict match or null.
 * searchKey (param `email`) is usually email, externalUserId, or loginName.
 * If searchKey contains @: match UCM email, loginName, or externalId exactly.
 * If no @: match firstName.lastName, or local-part of email/login/externalId.
 */
export async function findUserByEmailOrExternalId(request, jwt, email) {
  let res = await request.post(urlData.getUsersUrl, {
    data: searchUserBody(email),
    headers: headerData.getAllUsersHeaders(jwt, "application/json"),
  });
  if (res.status() !== 200) {
    logger.error(
      `[${reusableFunctions.orgHostname()}] search failed (${res.status()}): ${email}`,
    );
    return null;
  }
  let body = await res.json();
  let users = body.users || [];
  let searchLower = email.trim().toLowerCase();
  let searchHasAt = searchLower.includes("@");

  for (let u of users) {
    if (searchHasAt) {
      if (userMatchesEmailLikeSearch(u, searchLower)) {
        return u;
      }
    } else if (userMatchesFirstLastSearch(u, searchLower)) {
      return u;
    }
  }
  return null;
}

export async function putUserInactiveInOrg(request, jwt, user, logLine) {
  let host = reusableFunctions.orgHostname();
  let externalId = user.externalId || user.email || user.loginName;
  let res = await request.put(urlData.ediAdminUserUrl(user.id), {
    data: inactiveUserPutBody(externalId),
    headers: headerData.editAdminUserHeaders(jwt, "application/json"),
  });
  if (res.status() === 200) {
    logger.info(`[${host}] ${logLine}`);
  } else {
    logger.error(
      `[${host}] deactivate API error HTTP ${res.status()} | ${logLine}`,
    );
  }
}

export async function putUserActiveInOrg(request, jwt, user, logLine, password = null) {
  let host = reusableFunctions.orgHostname();
  let externalId = user.externalId || user.email || user.loginName;
  let res = await request.put(urlData.ediAdminUserUrl(user.id), {
    data: activeUserPutBody(externalId, password),
    headers: headerData.editAdminUserHeaders(jwt, "application/json"),
  });
  if (res.status() === 200) {
    logger.info(`[${host}] ${logLine}`);
  } else {
    logger.error(
      `[${host}] reactivate API error HTTP ${res.status()} | ${logLine}`,
    );
  }
}

/**
 * Export flow: POST /api/ucm/users search by externalId → read user.id → PUT inactive.
 * Uses existing putUserInactiveInOrg for the PUT step only.
 */
export async function putUserInactiveByExternalId(
  request,
  jwt,
  externalId,
  logLine = null,
) {
  const host = reusableFunctions.orgHostname();
  const id = String(externalId ?? "").trim();
  if (!id) {
    logger.warn(`[${host}] deactivate SKIP — empty externalId`);
    return;
  }

  const searchRes = await request.post(urlData.getUsersUrl, {
    data: searchUserBody(id),
    headers: headerData.getAllUsersHeaders(jwt, "application/json"),
  });
  if (searchRes.status() !== 200) {
    logger.error(
      `[${host}] search failed (${searchRes.status()}) | externalId=${id}`,
    );
    return;
  }

  const searchLower = id.toLowerCase();
  const users = (await searchRes.json()).users || [];
  const user = users.find(
    (u) => String(u.externalId ?? "").trim().toLowerCase() === searchLower,
  );

  if (!user) {
    logger.warn(`[${host}] deactivate SKIP — no UCM user | externalId=${id}`);
    return;
  }

  const line = logLine || `deactivate OK | externalId=${id}`;
  await putUserInactiveInOrg(request, jwt, user, line);
}

/** @skillsoft.com sheet email → search by that email, then deactivate. */
export async function inactiveUserInOrg(request, jwt, email) {
  let host = reusableFunctions.orgHostname();
  let user = await findUserByEmailOrExternalId(request, jwt, email);
  if (!user) {
    logger.info(`[${host}] deactivate SKIP — no user | ${email}`);
    return;
  }
  await putUserInactiveInOrg(
    request,
    jwt,
    user,
    `deactivate OK | ${email} | Skillsoft row (lookup by email)`,
  );
}

/**
 * One termination sheet row.
 * @skillsoft.com → email search only.
 * Else → first.last (if names on sheet), then row email fallback.
 */
export async function inactiveUserInOrgForDeactivateSheetRow(
  request,
  jwt,
  row,
) {
  const host = reusableFunctions.orgHostname();
  const rowEmail = String(row?.email ?? "").trim();
  if (!rowEmail) {
    logger.warn(`[${host}] deactivate SKIP — empty row email`);
    return;
  }

  if (rowEmail.toLowerCase().endsWith(SKILLSOFT_EMAIL_SUFFIX)) {
    await inactiveUserInOrg(request, jwt, rowEmail);
    return;
  }

  const fk = collapseNamePart(row?.firstName);
  const lk = collapseNamePart(row?.lastName);
  let searchKey;
  if (fk && lk) {
    searchKey = `${fk}.${lk}`;
  } else {
    searchKey = rowEmail;
    logger.warn(
      `[${host}] deactivate WARN — missing first/last on row; using email only | ${rowEmail}`,
    );
  }

  let user = await findUserByEmailOrExternalId(request, jwt, searchKey);
  let matchedByEmail = false;

  if (!user && fk && lk && rowEmail.includes("@")) {
    let emailKey = rowEmail.trim().toLowerCase();
    if (emailKey !== searchKey.toLowerCase()) {
      user = await findUserByEmailOrExternalId(request, jwt, emailKey);
      if (user) {
        matchedByEmail = true;
      }
    }
  }

  if (!user) {
    let tried =
      fk && lk
        ? `"${searchKey}" then "${rowEmail.trim().toLowerCase()}"`
        : `"${searchKey}"`;
    logger.warn(
      `[${host}] deactivate SKIP — no user | row=${rowEmail} | tried ${tried}`,
    );
    return;
  }

  let successLine;
  if (matchedByEmail) {
    successLine = `deactivate OK | ${rowEmail} | matched by row email (first.last "${searchKey}" did not match UCM name fields)`;
  } else if (fk && lk) {
    successLine = `deactivate OK | ${rowEmail} | matched by first.last "${searchKey}"`;
  } else {
    successLine = `deactivate OK | ${rowEmail} | matched by email "${searchKey}"`;
  }

  await putUserInactiveInOrg(request, jwt, user, successLine);
}
