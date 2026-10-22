export function createLearningProgramBusineesObjBody(ObjName) {
  return {
    name: ObjName,
    localizedMetadata: [
      {
        name: ObjName,
        locale: "en-US",
      },
    ],
  };
}
