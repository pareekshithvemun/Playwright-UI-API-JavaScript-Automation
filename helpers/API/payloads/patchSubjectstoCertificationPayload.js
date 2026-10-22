export function patchSubjectstoCertificationPayload(subUuIds) {
  return {
    subjectUuids: subUuIds,
    removeEnglishFirst: true,
  };
}
