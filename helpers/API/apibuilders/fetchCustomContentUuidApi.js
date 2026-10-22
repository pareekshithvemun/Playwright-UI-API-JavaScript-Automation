import { expect, fetchCustomContentByNamePayload, fetchLinkedContentSummariesApi, headerData, logger, reusableFunctions, searchByTitleOnlyBody, urlData } from "../../../path.js";

/**
 * Resolves content UUID by name and type: Journey/Channel → channels API (published only);
 * customContent → linked content summaries paginated (first page, max 500), then row match: title (trim + lowercase), `status === 2`, `visibleToLearners === true`.
 * Channel/content-item name resolution → WEB search, title match only.
 */
export async function fetchCustomContentUuidApi(request, jwt, name, type) {
  let normalizedType = type.trim().toLowerCase();

  switch (normalizedType) {
    case "journey":
    case "channel":
      return await fetchJourneyOrChannelUuid(
        request,
        jwt,
        name,
        normalizedType,
      );

    case "customcontent":
      return await fetchLinkedContentUuidFromSummaries(request, jwt, name);

    default:
      let fallbackUuid = reusableFunctions.uuidGenerator();
      logger.warn(
        `[custom landing UUID] Using random UUID — unsupported type "${type}" for "${name}" (not Journey/Channel/customContent): ${fallbackUuid}`,
      );
      return fallbackUuid;
  }
}

/** Linked content summaries paginated: delegates to `fetchLinkedContentSummariesApi`; match row in `contentItems`. */
async function fetchLinkedContentUuidFromSummaries(request, jwt, name) {
  try {
    const body = await fetchLinkedContentSummariesApi(request, jwt, 0, 500);
    const items = body?.contentItems || [];
    const want = name.trim().toLowerCase();
    const matched = items.find(
      (r) =>
        (r.title || "").trim().toLowerCase() === want &&
        r.visibleToLearners === true &&
        isPublishedStatus(r.status),
    );
    const uuid = matched?.linkedContentUuid;
    if (uuid) {
      logger.info(
        `[custom landing UUID] From org API (linked content summaries) for "${name.trim()}": ${uuid} (status=2, visibleToLearners=true)`,
      );
      return uuid;
    }
  } catch (e) {
    logger.error(
      `Linked content summaries paginated failed for "${name}": ${e.message}`,
    );
  }
  const randomUuid = reusableFunctions.uuidGenerator();
  logger.warn(
    `[custom landing UUID] Using random UUID — no linked content row matching title + status 2 + visibleToLearners for "${name.trim()}": ${randomUuid}`,
  );
  return randomUuid;
}

function isPublishedStatus(status) {
  return status === 2 || Number(status) === 2;
}

/**
 * WEB search: title match only (trim + lowercase). Used for channel content items (ASSESSMENT, COURSE, etc.), not custom landing customContent cards.
 */
export async function fetchContentUuidByNameApi(request, jwt, name) {
  try {
    const resp = await request.post(urlData.searchContentUrl, {
      data: searchByTitleOnlyBody(name),
      headers: headerData.searchContentHeaders(jwt, "application/json"),
    });
    expect(resp.status()).toBe(200);
    const batch = await resp.json();
    const results =
      (Array.isArray(batch) ? batch[0] : batch)?.data?.search?.results || [];
    const want = name.trim().toLowerCase();
    const matched = results.find(
      (r) => r.title.trim().toLowerCase() === want,
    );
    const uuid = matched?.contentUuid || matched?.contentId;
    if (uuid) {
      logger.info(
        `[custom landing UUID] From org API (content search) for "${name.trim()}": ${uuid}`,
      );
      return uuid;
    }
  } catch (e) {
    logger.error(`Search failed for "${name}": ${e.message}`);
  }
  const randomUuid = reusableFunctions.uuidGenerator();
  logger.warn(
    `[custom landing UUID] Using random UUID — org search returned no title match (trim + lowercase) for "${name.trim()}": ${randomUuid}`,
  );
  return randomUuid;
}

/**
 * Channels API: first published (status 2) item whose localization title equals name after trim + lowercase → channelUuid.
 */
async function fetchJourneyOrChannelUuid(request, jwt, name, normalizedType) {
  const apiType = normalizedType === "journey" ? "JOURNEY" : "CHANNEL";
  try {
    const headers = headerData.getAllJourneyHeaders(jwt, "application/json");
    const resp = await request.post(urlData.getChannelsorJourneysInOrgUrl, {
      data: fetchCustomContentByNamePayload(name, apiType),
      headers,
    });
    expect(resp.status()).toBe(200);
    const channels = (await resp.json()).channels || [];
    const matched = channels.find(
      (ch) =>
        ch.status === 2 &&
        ch.localizations?.some(
          (loc) =>
            loc.title?.trim().toLowerCase() === name.trim().toLowerCase(),
        ),
    );

    if (matched) {
      logger.info(
        `[custom landing UUID] From org API (${apiType} list) for "${name.trim()}": ${matched.channelUuid}`,
      );
      return matched.channelUuid;
    }

    let randomUuid = reusableFunctions.uuidGenerator();
    logger.warn(
      `[custom landing UUID] Using random UUID — no published ${apiType} in org with matching title (trim + lowercase) for "${name.trim()}": ${randomUuid}`,
    );
    return randomUuid;
  } catch (error) {
    logger.error(`Failed to fetch ${apiType} UUID for "${name}": ${error}`);
    let randomUuid = reusableFunctions.uuidGenerator();
    logger.warn(
      `[custom landing UUID] Using random UUID — API error fetching ${apiType} for "${name.trim()}": ${randomUuid}`,
    );
    return randomUuid;
  }
}
