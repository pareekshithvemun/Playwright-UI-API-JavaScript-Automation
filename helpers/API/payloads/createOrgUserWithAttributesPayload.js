/**
 * UCM create-user body with role_uuid and/or role string, plus custom_attributes.
 * Prefer role_uuid when known; role string (e.g. "learner") matches createUserPayload.
 */
export function createOrgUserWithAttributesPayload({
  firstName,
  lastName,
  email,
  password,
  roleUuid,
  role,
  customAttributes = [],
}) {
  const body = {
    status: "active",
    scheduled_email: { send_email: false, send_at: new Date().toISOString() },
    date: new Date().toISOString(),
    is_lx_studio_accessor: false,
    is_lx_studio_publisher: false,
    first_name: firstName,
    last_name: lastName,
    login_name: email,
    external_id: email,
    email,
    password,
    must_reset_password: false,
    custom_attributes: customAttributes,
  };
  if (roleUuid) {
    body.role_uuid = roleUuid;
  }
  if (role) {
    body.role = role;
  }
  return body;
}
