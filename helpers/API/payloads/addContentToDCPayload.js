export function addContentToDCBody(containerId, orgId, adminId, contentMap) {
  return {
    containerId: containerId,
    orgId: orgId,
    adminId: adminId,
    contentMaps: contentMap,
  };
}
