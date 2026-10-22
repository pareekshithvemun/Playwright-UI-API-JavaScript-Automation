export function tokenGeneratorWithOrgIdPayload(
  userName,
  password,
  organizationId
) {
  return {
    login: userName,
    password: password,
    organizationId: organizationId,
    recaptchaToken: "",
  };
}
