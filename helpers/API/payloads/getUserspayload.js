export function getAllUsersBody(query, options = {}) {
  return {
    q: query,
    max: options.max ?? 2500,
    offset: options.offset ?? 0,
    sort: options.sort ?? "lastName,firstName",
    roles: [],
  };
}

/** Same /api/ucm/users POST as above, but small page size — used to look up one user by email. */
export function searchUserBody(email, options = {}) {
  const { max = 100, offset = 0, sort = "" } = options;
  return {
    q: email,
    max,
    offset,
    sort,
  };
}

/** PUT /api/ucm/users/{id} — active or inactive; status + external_id + date only (no custom_attributes). */
export function userStatusPutBody(status, externalId, dateIso = null) {
  return {
    status,
    external_id: externalId,
    date: dateIso || new Date().toISOString(),
  };
}

export function inactiveUserPutBody(externalId, dateIso = null) {
  return userStatusPutBody("inactive", externalId, dateIso);
}

/** Rehire: active + require password change on first login; optional temp password. */
export function activeUserPutBody(externalId, password = null, dateIso = null) {
  let body = {
    ...userStatusPutBody("active", externalId, dateIso),
    must_reset_password: true,
  };
  if (password) {
    body.password = password;
  }
  return body;
}

/** PUT /api/ucm/users/{id} — assign a direct manager only. */
export function setDirectManagerPayload(managerId) {
  return {
    direct_manager: {
      id: managerId,
    },
  };
}
