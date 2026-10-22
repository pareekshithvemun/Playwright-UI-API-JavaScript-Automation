export function saveQestionPayload(
  containerId,
  adminId,
  parentId,
  answerStructureObject,
  questionOrder,
  questionText,
  selectType,
  displayType,
  subType,
  locale


) {
  return {
    containerId: containerId,
    adminId: adminId,
    questionStructure: {
      order: questionOrder,
      subType: subType,
      properties: {
        selectType: selectType,
        displayType: displayType,
      },
      localizedDefinitions: [
        {
          definition: {
            text: questionText,
          },
          locale: locale,
        },
      ],
      parentId: parentId,
    },
    deletedAnswers: [],
    answerStructure: answerStructureObject,
  };
}
