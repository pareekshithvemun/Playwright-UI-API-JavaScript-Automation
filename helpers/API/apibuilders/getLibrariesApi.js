import { headerData, urlData, getFetchLibrariesPayload, expect, logger } from "../../../path.js";

export async function getLibrariesApi(request, jwt, locale = "en-US") {
  const headers = headerData.getChannelFromOrgHeaders(jwt, "application/json");
  const res = await request.post(urlData.getFetchLibrariesUrl, {
    data: getFetchLibrariesPayload(locale),
    headers,
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body;
}

/**
 * Extract subject UUIDs (and optional area UUID) from fetchLibraries response.
 * Libraries response: array of { data: { libraries: [ { subjects: [areas] } ] } };
 * each area has id, title, subjects: [ { id, title } ].
 */
export function getSubjectUuidsFromLibraries(
  librariesResponse,
  areaName,
  subjectNames,
) {
  const subjectUuids = [];
  let areaUuid;
  const libraries =
    Array.isArray(librariesResponse) && librariesResponse[0]?.data?.libraries
      ? librariesResponse[0].data.libraries
      : [];
  const allAreas = libraries.flatMap((lib) => lib.subjects || []);
  const area = allAreas.find((a) => a.title === areaName);

  if (!area) {
    const availableAreaTitles = allAreas.map((a) => a.title).filter(Boolean);
    logger.warn(
      `Area not found: "${areaName}". Available areas in this org: [${availableAreaTitles.join(", ") || "none"}]`,
    );
    return { subjectUuids, areaUuid };
  }

  areaUuid = area.id;
  const subs = area.subjects || [];
  const availableSubjectTitles = subs.map((s) => s.title).filter(Boolean);

  for (const name of subjectNames) {
    const sub = subs.find((s) => s.title === name);
    if (sub?.id) {
      subjectUuids.push(sub.id);
    } else {
      logger.warn(
        `Subject not found: "${name}" under area "${areaName}". Available subjects: [${availableSubjectTitles.join(", ") || "none"}]`,
      );
    }
  }

  return { subjectUuids, areaUuid };
}
