/**
 * PUT /api/ucm/users/{id} — repurpose a pool placeholder (`newuser_N@…`) to a real hire
 * (email / login / external_id swap). Matches UCM snake_case body used elsewhere.
 */
export function percipiodemoHireSwapPutBody({
  existingExternalId,
  hireEmail,
  firstName,
  lastName,
  password,
}) {
  return {
    status: "active",
    external_id: existingExternalId,
    new_external_id: hireEmail,
    email: hireEmail,
    login_name: hireEmail,
    first_name: firstName,
    last_name: lastName,
    password,
    must_reset_password: false,
    date: new Date().toISOString(),
  };
}
