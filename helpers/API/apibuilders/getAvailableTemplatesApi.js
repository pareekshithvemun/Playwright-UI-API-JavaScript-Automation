import {
  headerData,
  urlData,
  expect,
  logger,
  getAvailableTemplatesPayload,
} from "../../../path.js";

export async function getAvailableTemplatesApi(
  request,
  jwt,
  containerId,
  templateType = ""
) {
  try {
    let headers =
      headerData.aiContentGenGetAvailableTemplatesHeaders(jwt, containerId);
    let payload = getAvailableTemplatesPayload(templateType);

    let res = await request.post(urlData.aiContentGenGetAvailableTemplatesUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Fetched ${resp.length} available templates`);
    return resp;
  } catch (error) {
    logger.error(`Failed to get available templates: ${error}`);
    throw error;
  }
}

export function getTemplateIdByName(templates, templateName) {
  const template = templates.find((t) => t.templateName.trim().toLowerCase() === templateName.trim().toLowerCase());
  if (!template) {
    throw new Error(
      `Template "${templateName}" not found. Available: ${templates.map((t) => t.templateName).join(", ")}`
    );
  }
  return template.id;
}
