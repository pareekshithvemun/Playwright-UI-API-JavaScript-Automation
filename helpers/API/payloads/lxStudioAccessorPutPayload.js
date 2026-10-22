/** PUT /api/ucm/users/{id} — enable LX Studio accessor for an existing user. */
export function lxStudioAccessorPutPayload(externalId, dateIso = null) {
  return {
    external_id: externalId,
    is_lx_studio_accessor: true,
    date: dateIso || new Date().toISOString(),
  };
}
