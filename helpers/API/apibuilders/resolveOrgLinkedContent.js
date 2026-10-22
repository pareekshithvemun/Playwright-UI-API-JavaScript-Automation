import {
  createLinkedContent,
  fetchAllLinkedContentSummaries,
  logger,
  publishLinkContent,
  reusableFunctions,
} from "../../../path.js";

/**
 * One GET (paginated) of org linked-content summaries, then for each row:
 * reuse published match by title, else publish draft, else create + publish.
 * Returns map title → linkedContentUuid (same keys as channel JSON placeholders).
 *
 * @param {Array<{ title: string, contentUrl: string, desc: string, imageUrl: string, modality: string, duration: number }>} linkedContentRows
 * @returns {Promise<Record<string, string>>}
 */
export async function resolveAllOrgLinkedContent(request, jwt, linkedContentRows) {
  const contentUUIDs = {};
  if (!linkedContentRows || linkedContentRows.length === 0) {
    return contentUUIDs;
  }

  let items = (await fetchAllLinkedContentSummaries(request, jwt)) || [];

  for (const contentData of linkedContentRows) {
    const title = contentData.title;
    const sameTitle = items.filter((item) =>
      reusableFunctions.linkedContentTitlesMatch(item.title, title),
    );

    const ready = sameTitle.find(
      reusableFunctions.linkedContentIsPublishedAndVisible,
    );
    if (ready?.linkedContentUuid) {
      logger.info(
        `Linked content "${title}": reusing existing published uuid=${ready.linkedContentUuid}`,
      );
      contentUUIDs[title] = ready.linkedContentUuid;
      continue;
    }

    const draftNotRetired = sameTitle.find(
      (item) =>
        item.linkedContentUuid &&
        !reusableFunctions.linkedContentIsRetired(item) &&
        !reusableFunctions.linkedContentIsPublishedAndVisible(item),
    );
    if (draftNotRetired?.linkedContentUuid) {
      logger.info(
        `Linked content "${title}": publishing existing draft uuid=${draftNotRetired.linkedContentUuid}`,
      );
      await publishLinkContent(request, jwt, draftNotRetired.linkedContentUuid);
      contentUUIDs[title] = draftNotRetired.linkedContentUuid;
      continue;
    }

    logger.info(`Linked content "${title}": creating new`);
    const uuid = await createLinkedContent(
      request,
      jwt,
      title,
      contentData.contentUrl,
      contentData.desc,
      contentData.imageUrl,
      contentData.modality,
      contentData.duration,
    );
    if (!uuid) {
      throw new Error(
        `createLinkedContent did not return a uuid for "${title}"`,
      );
    }
    await publishLinkContent(request, jwt, uuid);
    contentUUIDs[title] = uuid;
    items.push({
      title,
      linkedContentUuid: uuid,
      status: 2,
      visibleToLearners: true,
      retired: false,
      isRetired: false,
    });
  }

  return contentUUIDs;
}
