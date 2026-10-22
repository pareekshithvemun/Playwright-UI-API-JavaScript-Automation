import reusableFunctions from "../../UI/commonFunctions.js";

export function aiAssistantPayload(userUUId, chatMessages, percipioToken) {
  let randomUUID = reusableFunctions.uuidGenerator();
  return {
    sessionDetails: {
      userUuid: userUUId,
      simulationUuid: randomUUID,
    },
    state: {
      userSettings: {
        allowStoredData: true,
        realTimeDictation: false,
        canUserOverride: true,
        coachId: "",
        locale: "",
      },
      chatMessages: chatMessages,
    },
    // ✅ Keep Bearer prefix since backend requires it
    percipioToken: `Bearer ${percipioToken}`,
  };
}
