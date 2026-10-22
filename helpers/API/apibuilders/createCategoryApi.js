import {
  urlData,
  headerData,
  createCategoryPayload,
  logger,
  expect,
} from "../../../path.js";

export async function createCategoryApi(request, jwt, categoryName, ownerId) {
  try {
    const url = urlData.aiSimulatorGraphqlUrl;
    const headers = headerData.aiSimulatorGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = createCategoryPayload(categoryName, ownerId);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    // Validate response structure
    if (
      !resp.data ||
      !resp.data.createCategory ||
      !resp.data.createCategory.id
    ) {
      throw new Error("Invalid response structure from createCategory");
    }

    logger.info(
      `Category '${categoryName}' created with ID: ${resp.data.createCategory.id}`
    );

    return resp;
  } catch (error) {
    logger.error(`Error in createCategoryApi: ${error.message}`);
    throw error;
  }
}
