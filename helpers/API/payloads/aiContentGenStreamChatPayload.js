export function aiContentGenStreamChatPayload(
  containerId,
  messages,
  courseStep = "inputs",
  context = {}
) {
  return {
    containerId,
    state: {
      messages,
      courseStep,
      context: {
        courseId: "",
        specialInstructions: "",
        courseTitle: "",
        courseType: "",
        workflowType: "",
        expertiseLevel: "",
        targetAudience: "",
        courseDuration: "",
        numberOfTopics: "",
        learningObjectives: "",
        sessionId: null,
        containerId,
        sourceDocIds: [],
        lxStudioSourceDocuments: [],
        is_external_user: true,
        templateId: context.templateId,
        audioProvider: context.audioProvider || "azureSpeech",
        audioVoice: context.audioVoice || "en-US-AvaMultilingualNeural",
        ...context,
      },
    },
    designBriefFailed: false,
  };
}
