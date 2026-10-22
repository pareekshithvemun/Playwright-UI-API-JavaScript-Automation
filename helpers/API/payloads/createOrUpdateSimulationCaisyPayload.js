export function createOrUpdateSimulationCaisyPayload(
  scenarioId,
  ownerId,
  title,
  description,
  categoryId,
  behavior,
  scenarioPrompt,
  metaData,
  practiceName = "",
  roleModelName = "",
  practiceText = "",
  roleModelText = "",
  ksSummary = "",
  primaryCharId = null,
  supportCharId = null
) {
  return {
    operationName: "createOrUpdateSimulation",
    variables: {
      scenarioId: scenarioId,
      sourceSystem: "LX-STUDIO",
      ownerId: ownerId,
      title: title,
      description: description,
      machineDescription: scenarioPrompt,
      categoryId: categoryId,
      behavior: behavior,
      practiceName: practiceName,
      roleModelName: roleModelName,
      practiceText: practiceText,
      roleModelText: roleModelText,
      ksSummary: ksSummary,
      ...(primaryCharId && { primaryCharId: primaryCharId }),
      ...(supportCharId && { supportCharId: supportCharId }),
      metaData: metaData,
    },
    query: `mutation createOrUpdateSimulation($ownerId: ID, $title: String, $description: String, $machineDescription: String, $categoryId: ID, $scenarioId: ID, $behavior: String, $practiceName: String, $roleModelName: String, $primaryCharId: ID, $supportCharId: ID, $practiceText: String, $roleModelText: String, $sourceSystem: String, $metaData: JSON, $ksSummary: String) {
  createOrUpdateSimulation(
    ownerId: $ownerId
    title: $title
    description: $description
    machineDescription: $machineDescription
    categoryId: $categoryId
    scenarioId: $scenarioId
    behavior: $behavior
    practiceName: $practiceName
    roleModelName: $roleModelName
    primaryCharId: $primaryCharId
    supportCharId: $supportCharId
    practiceText: $practiceText
    roleModelText: $roleModelText
    sourceSystem: $sourceSystem
    metaData: $metaData
    ksSummary: $ksSummary
  )
}`,
  };
}
