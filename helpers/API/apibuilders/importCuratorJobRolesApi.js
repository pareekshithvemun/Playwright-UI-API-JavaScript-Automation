import {
  headerData,
  urlData,
  roleClassificationsPayload,
  importCuratorJobRolesPayload,
  publishCuratorJobRolesPayload,
  expect,
  logger,
} from "../../../path.js";

export async function listRoleClassificationsApi(request, jwt) {
  try {
    const response = await request.post(urlData.knowledgeGraphGraphqlUrl, {
      data: roleClassificationsPayload(),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errorText = (body?.errors || []).map((error) => error.message).filter(Boolean).join("; ");
    if (errorText) {
      throw new Error(errorText);
    }
    const classifications = body?.data?.kgGetRoleClassifications || [];
    logger.info(`Loaded ${classifications.length} role classifications`);
    return classifications;
  } catch (error) {
    logger.error(`Could not load role classifications: ${error.message}`);
    throw error;
  }
}

export async function importCuratorJobRolesApi(request, jwt, jobRoles) {
  try {
    const response = await request.post(urlData.curatorGraphqlUrl, {
      data: importCuratorJobRolesPayload(jobRoles),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errorText = (body?.errors || []).map((error) => error.message).filter(Boolean).join("; ");
    if (errorText) {
      throw new Error(errorText);
    }
    const importedRoleIds = body?.data?.skilzImportJobRoles;
    if (!Array.isArray(importedRoleIds) || importedRoleIds.length !== jobRoles.length) {
      throw new Error(`Import did not return one id per role. Got ${JSON.stringify(importedRoleIds)}`);
    }
    for (let roleIndex = 0; roleIndex < jobRoles.length; roleIndex += 1) {
      logger.info(`Imported | ${jobRoles[roleIndex].name} | ${importedRoleIds[roleIndex]}`);
    }
    return importedRoleIds;
  } catch (error) {
    logger.error(`Could not import job roles: ${error.message}`);
    throw error;
  }
}

export async function publishCuratorJobRolesApi(request, jwt, jobRoleId, jobRoleName) {
  try {
    const response = await request.post(urlData.curatorGraphqlUrl, {
      data: publishCuratorJobRolesPayload([jobRoleId]),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errorText = (body?.errors || []).map((error) => error.message).filter(Boolean).join("; ");
    if (errorText) {
      throw new Error(errorText);
    }
    logger.info(`Published | ${jobRoleName} | ${jobRoleId}`);
  } catch (error) {
    logger.error(`Could not publish ${jobRoleName}: ${error.message}`);
    throw error;
  }
}
