import {
  urlData,
  headerData,
  createOrUpdateSimulationCaisyPayload,
  logger,
  expect,
} from "../../../path.js";

export async function createOrUpdateSimulationCaisyApi(
  request,
  jwt,
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
  supportCharId = null,
) {
  try {
    const url = urlData.aiSimulatorGraphqlUrl;
    const headers = headerData.aiSimulatorGraphqlHeaders(
      jwt,
      "application/json",
    );
    const payload = createOrUpdateSimulationCaisyPayload(
      scenarioId,
      ownerId,
      title,
      description,
      categoryId,
      behavior,
      scenarioPrompt,
      metaData,
      practiceName,
      roleModelName,
      practiceText,
      roleModelText,
      ksSummary,
      primaryCharId,
      supportCharId,
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    // Validate response structure
    if (!resp.data || !resp.data.createOrUpdateSimulation) {
      throw new Error(
        "Invalid response structure from createOrUpdateSimulation",
      );
    }

    logger.info(
      `Scenario '${title}' created successfully with ID: ${scenarioId}`,
    );

    return resp;
  } catch (error) {
    logger.error(`Error in createOrUpdateSimulationCaisyApi: ${error.message}`);
    throw error;
  }
}
