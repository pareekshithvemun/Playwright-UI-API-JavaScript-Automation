export function grantCompletionBody(orgid, adminUserId, contentToBeCompleted) {
  return {
    payload: {
      orgId: orgid,
      grantorId: adminUserId,
      data: contentToBeCompleted,
    },
    privilegeMask: "1bdddffb8e3c0d67fbffffffbffffdfb",
    providerName: null,
    providerContext: null,
  };
}
