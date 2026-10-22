export function startConvProcessingPayload(
  conversationId,
  triggerAiGen = true
) {
  return {
    operationName: "startConvProcessing",
    variables: {
      conversationId: conversationId,
      triggerAiGen: triggerAiGen,
      pipeLineMode: "quality",
    },
    query:
      "mutation startConvProcessing($conversationId: ID!, $triggerAiGen: Boolean, $pipeLineMode: String) {\n  startConvProcessing(\n    conversationId: $conversationId\n    triggerAiGen: $triggerAiGen\n    pipeLineMode: $pipeLineMode\n  )\n}",
  };
}
