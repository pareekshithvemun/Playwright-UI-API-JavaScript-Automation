import { fetchContentUuidByNameApi } from "./fetchCustomContentUuidApi.js";
import { logger } from "../../../logger.js";

/** Standard UUID v4 pattern (8-4-4-4-12 hex). */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves channelContent items where contentItemUuid is a content name into actual UUIDs.
 * - If contentItemUuid is already a UUID, it is left unchanged.
 * - If the content name is in linkedContentUuidMap (e.g. from linkedContentData created in test), that UUID is used.
 * - Otherwise the UUID is fetched via search API (for ASSESSMENT, COURSE, or existing LINKED_CONTENT).
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} jwt
 * @param {Array<{ contentItemUuid: string, contentItemType: string }>} channelContent - channelContent array (mutated in place)
 * @param {Record<string, string>} [linkedContentUuidMap] - map of content title → UUID for linked content created in test (e.g. contentUUIDs from beforeAll)
 * @returns {Promise<Array<{ contentItemUuid: string, contentItemType: string }>>} the same array with contentItemUuid replaced by UUIDs
 */
export async function resolveChannelContentNamesToUuids(
  request,
  jwt,
  channelContent,
  linkedContentUuidMap = {}
) {
  if (!channelContent || !Array.isArray(channelContent)) {
    return channelContent;
  }

  for (let i = 0; i < channelContent.length; i++) {
    const item = channelContent[i];
    const nameOrUuid = item.contentItemUuid?.trim?.() || "";

    if (!nameOrUuid) continue;

    if (UUID_REGEX.test(nameOrUuid)) {
      logger.info(`Content item already has UUID: ${nameOrUuid}`);
      continue;
    }

    if (linkedContentUuidMap[nameOrUuid]) {
      item.contentItemUuid = linkedContentUuidMap[nameOrUuid];
      logger.info(
        `Resolved "${nameOrUuid}" from linkedContentUuidMap → ${item.contentItemUuid}`
      );
      continue;
    }

    const uuid = await fetchContentUuidByNameApi(request, jwt, nameOrUuid);
    item.contentItemUuid = uuid;
    logger.info(
      `Resolved "${nameOrUuid}" (${item.contentItemType}) via search → ${uuid}`
    );
  }

  return channelContent;
}
