import { logger } from "../../../logger.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import { fetchCustomContentUuidApi } from "../apibuilders/fetchCustomContentUuidApi.js";

// HOW THIS FILE WORKS
//
// Problem: Page data has org-specific URLs (domain + UUIDs). When creating in another org,
// we must fix domain and page UUIDs. CDN URLs (cdn2.percipio.com) are never changed.
//
// Steps:
//   1. autoConvertApiResponse — Strip API-only fields; turn /custom-pages/ URLs into
//      {{CHILD_PAGE:Title}} placeholders. Strategy A: URL UUID matches a pageUuid → use that
//      page title. Strategy B: Card heading matches a child page title → use that title.
//   2. saveCustomLandingPagePayload — New UUIDs for root + children; replace placeholders
//      with {baseURL}/custom-pages/{rootUuid}/{childUuid}; swap any leftover org domains to baseURL.
//   3. resolveCustomContentUuids (called from spec) — For customContent[]: resolve UUID by
//      name+type (channels API or search API), then replace in template by card title/heading.
//      Old pages: name = card title. New pages: name = org/API match string; heading = card title on the page
//      (customContent, Journey, and Channel all use the same name vs heading split when heading is set).
//
//   4. Root payload and processChildPages set collaborators [] and scopeType 2. options.audienceUuid
//      adds audienceAssociations on the root only.
//

/** If pageData looks like API response: strip server fields, build titleMap + allChildTitles, then run URL→placeholder replacement. */
function autoConvertApiResponse(pageData) {
  const isApiFormat =
    pageData.pageUuid || pageData.createdBy || pageData.createdDate;

  if (!isApiFormat) {
    return pageData;
  }

  logger.info(
    `Auto-converting API response to test data format for: ${pageData.title}`
  );

  const titleMap = new Map();
  const allChildTitles = new Set();
  function buildMapsFromOriginal(p) {
    if (p.pageUuid) titleMap.set(p.pageUuid, p.title);
    if (p.title) allChildTitles.add(p.title);
    p.childPages?.forEach((child) => buildMapsFromOriginal(child));
  }
  buildMapsFromOriginal(pageData);

  const fieldsToRemove = [
    "pageUuid",
    "createdBy",
    "modifiedBy",
    "createdDate",
    "modifiedDate",
    "parentPageUuid",
  ];

  function cleanPage(page) {
    const cleaned = {};
    for (const [key, value] of Object.entries(page)) {
      if (!fieldsToRemove.includes(key)) {
        cleaned[key] =
          key === "childPages" && Array.isArray(value)
            ? value.map((child) => cleanPage(child))
            : value;
      }
    }
    return cleaned;
  }

  const convertedData = cleanPage(pageData);
  replaceUrlsWithPlaceholdersInData(convertedData, titleMap, allChildTitles);
  return convertedData;
}

/** Replace /custom-pages/ URLs with {{CHILD_PAGE:Title}}. A: URL child UUID in titleMap → use that title. B: Card heading in allChildTitles → use heading. */
function replaceUrlsWithPlaceholdersInData(
  page,
  titleMap = null,
  allChildTitles = null
) {
  if (!titleMap) {
    titleMap = new Map();
    allChildTitles = new Set();
    function buildTitleMap(p) {
      if (p.pageUuid) titleMap.set(p.pageUuid, p.title);
      if (p.title) allChildTitles.add(p.title);
      p.childPages?.forEach((child) => buildTitleMap(child));
    }
    buildTitleMap(page);
  }

  if (!page.templateData?.includes("/custom-pages/")) {
    page.childPages?.forEach((child) =>
      replaceUrlsWithPlaceholdersInData(child, titleMap, allChildTitles)
    );
    return;
  }

  page.templateData = page.templateData.replace(
    /https?:\/\/[^/]+\/custom-pages\/[a-f0-9-]+\/([a-f0-9-]+)/g,
    (match, childUuid) => {
      const childTitle = titleMap.get(childUuid);
      if (childTitle) {
        logger.info(`UUID-match: URL → {{CHILD_PAGE:${childTitle}}}`);
        return `{{CHILD_PAGE:${childTitle}}}`;
      }
      return match;
    }
  );

  if (page.templateData.includes("/custom-pages/") && allChildTitles?.size > 0) {
    try {
      const templateObj = JSON.parse(page.templateData);
      if (templateObj.placedItems) {
        replaceUrlsByCardHeading(templateObj.placedItems, allChildTitles);
        page.templateData = JSON.stringify(templateObj);
      }
    } catch (e) {
      logger.warn(`Title-based URL replacement failed to parse: ${e.message}`);
    }
  }

  page.childPages?.forEach((child) =>
    replaceUrlsWithPlaceholdersInData(child, titleMap, allChildTitles)
  );
}

/** Strategy B: card heading in allChildTitles → set externalUrl, buttonTargetUrl, buttonProps.targetURL to {{CHILD_PAGE:heading}}. */
function replaceUrlsByCardHeading(placedItems, allChildTitles) {
  const customPageUrlPattern =
    /https?:\/\/[^/]+\/custom-pages\/[a-f0-9-]+\/[a-f0-9-]+/;

  for (const item of placedItems) {
    const content = item.content;
    if (!content) continue;

    const heading = content.heading;
    if (!heading || !allChildTitles.has(heading)) continue;

    const placeholder = `{{CHILD_PAGE:${heading}}}`;
    let replaced = false;

    if (content.externalUrl && customPageUrlPattern.test(content.externalUrl)) {
      content.externalUrl = placeholder;
      replaced = true;
    }
    if (
      content.buttonTargetUrl &&
      customPageUrlPattern.test(content.buttonTargetUrl)
    ) {
      content.buttonTargetUrl = placeholder;
      replaced = true;
    }
    if (
      content.buttonProps?.targetURL &&
      customPageUrlPattern.test(content.buttonProps.targetURL)
    ) {
      content.buttonProps.targetURL = placeholder;
      replaced = true;
    }

    if (replaced) {
      logger.info(`Title-match: URL → {{CHILD_PAGE:${heading}}}`);
    }
  }
}

/**
 * Build payload: convert if API format, new UUIDs for root + children, resolve {{CHILD_PAGE:Title}}
 * with baseURL, swap leftover org domains (skip CDN).
 * @param {{ audienceUuid?: string }} [options] — Root only: audienceAssociations when audienceUuid is set.
 */
export function saveCustomLandingPagePayload(pageData, userId, baseURL, options) {
  const cleanedPageData = autoConvertApiResponse(pageData);

  const pageUuid = reusableFunctions.uuidGenerator();
  const todayDate = reusableFunctions.getFormattedDate();

  logger.info(
    `Generated page UUID: ${pageUuid} for page: ${cleanedPageData.title}`
  );

  const payload = {
    pageUuid,
    title: cleanedPageData.title,
    createdBy: userId,
    modifiedBy: userId,
    createdDate: todayDate,
    modifiedDate: todayDate,
    displayOrder: cleanedPageData.displayOrder || 1,
    urlSubPath: cleanedPageData.urlSubPath || "",
    templateData: cleanedPageData.templateData,
    isEited: cleanedPageData.isEited || true,
    shouldHideInLeftNav: cleanedPageData.shouldHideInLeftNav || false,
    publishAction: cleanedPageData.publishAction || "draft",
    templateType: cleanedPageData.templateType || "custom",
    businessObjectiveUuid: cleanedPageData.businessObjectiveUuid || "",
    campaignUuid: cleanedPageData.campaignUuid || "",
    collaborators: [],
    scopeType: 2,
  };

  if (cleanedPageData.pageType) payload.pageType = cleanedPageData.pageType;
  if (cleanedPageData.hasOwnProperty("isHubpage"))
    payload.isHubpage = cleanedPageData.isHubpage;

  if (options?.audienceUuid) {
    payload.audienceAssociations = [
      { audienceUuid: options.audienceUuid, isDefault: false },
    ];
  }

  if (cleanedPageData.childPages?.length) {
    payload.childPages = processChildPages(
      cleanedPageData.childPages,
      pageUuid,
      userId
    );
  }

  if (baseURL) {
    const titleToUuidMap = buildTitleToUuidMap(payload);
    resolvePlaceholdersToUrls(payload, titleToUuidMap, baseURL, pageUuid);
    replaceLeftoverHardcodedDomains(payload, baseURL);
  }

  return payload;
}

/** New UUIDs + metadata for each child; recurses for nested children. */
function processChildPages(childPages, parentUuid, userId) {
  if (!childPages?.length) return [];

  return childPages.map((child) => {
    const childUuid = reusableFunctions.uuidGenerator();
    const todayDate = reusableFunctions.getFormattedDate();

    const processedChild = {
      pageUuid: childUuid,
      title: child.title,
      createdBy: userId,
      modifiedBy: userId,
      createdDate: todayDate,
      modifiedDate: todayDate,
      displayOrder: child.displayOrder || 1,
      urlSubPath: child.urlSubPath || "",
      templateData: child.templateData,
      isEited: child.isEited || true,
      shouldHideInLeftNav: child.shouldHideInLeftNav || false,
      publishAction: child.publishAction || "draft",
      parentPageUuid: parentUuid,
      collaborators: [],
      scopeType: 2,
    };

    if (child.pageType) processedChild.pageType = child.pageType;
    if (child.hasOwnProperty("isHubpage"))
      processedChild.isHubpage = child.isHubpage;

    if (child.childPages?.length) {
      processedChild.childPages = processChildPages(
        child.childPages,
        childUuid,
        userId
      );
    }

    return processedChild;
  });
}

/** Title → pageUuid for all pages in payload (for resolving {{CHILD_PAGE:Title}}). */
function buildTitleToUuidMap(page, map = new Map()) {
  map.set(page.title.trim(), page.pageUuid);
  page.childPages?.forEach((child) => buildTitleToUuidMap(child, map));
  return map;
}

/** {{CHILD_PAGE:Title}} → {baseURL}/custom-pages/{rootPageUuid}/{childPageUuid}. */
function resolvePlaceholdersToUrls(page, titleToUuidMap, baseURL, rootPageUuid) {
  if (page.templateData?.includes("{{CHILD_PAGE:")) {
    page.templateData = page.templateData.replace(
      /\{\{CHILD_PAGE:([^}]+)\}\}/g,
      (match, title) => {
        const trimmedTitle = title.trim();
        const targetUuid = titleToUuidMap.get(trimmedTitle);
        if (targetUuid) {
          const url = `${baseURL}/custom-pages/${rootPageUuid}/${targetUuid}`;
          logger.info(`Resolved: {{CHILD_PAGE:${trimmedTitle}}} → ${url}`);
          return url;
        }
        logger.warn(`Page not found for placeholder: "${trimmedTitle}"`);
        return match;
      }
    );
  }

  page.childPages?.forEach((child) =>
    resolvePlaceholdersToUrls(child, titleToUuidMap, baseURL, rootPageUuid)
  );
}

/** Swap org domain to baseURL for any remaining *.percipio.com URLs in templateData. Skips cdn and already-correct baseURL. */
function replaceLeftoverHardcodedDomains(page, baseURL) {
  if (page.templateData) {
    page.templateData = page.templateData.replace(
      /https?:\/\/[a-zA-Z0-9.-]+\.percipio\.com/g,
      (match) => {
        if (match.includes("cdn")) return match;
        if (match === baseURL) return match;
        logger.info(`Domain swap: ${match} → ${baseURL}`);
        return baseURL;
      }
    );
  }

  page.childPages?.forEach((child) =>
    replaceLeftoverHardcodedDomains(child, baseURL)
  );
}

/** Resolve UUID per customContent[] (name+type → API), then replace in template by card title/heading. Old: name = card title. New (e.g. Akara): name = search term, heading = card title. No-op if no customContent. */
export async function resolveCustomContentUuids(request, jwt, pageData, payload) {
  if (!pageData.customContent?.length) return;

  const contentMap = new Map();
  for (const item of pageData.customContent) {
    const uuid = await fetchCustomContentUuidApi(
      request,
      jwt,
      item.name,
      item.type,
    );
    const matchKey = item.heading != null ? item.heading : item.name;
    contentMap.set(matchKey, uuid);
  }

  replaceContentUuidsRecursive(payload, contentMap);
  logger.info(
    `Resolved ${contentMap.size} custom content UUID(s) for: ${pageData.title}`,
  );
}

/** For each card: if content.title/heading matches a contentMap key, replace that UUID everywhere in templateData (e.g. buttonTargetUrl, contentUuid). */
function replaceContentUuidsRecursive(page, contentMap) {
  if (!page.templateData) {
    page.childPages?.forEach((child) =>
      replaceContentUuidsRecursive(child, contentMap)
    );
    return;
  }

  try {
    const templateObj = JSON.parse(page.templateData);
    if (templateObj.placedItems) {
      for (const item of templateObj.placedItems) {
        const content = item.content;
        if (!content) continue;

        const cardLabel = (content.title || content.heading || "").trim();
        if (!cardLabel) continue;

        const normalizedCard = cardLabel.toLowerCase();

        for (const [mapKey, newUuid] of contentMap) {
          if (normalizedCard === (mapKey || "").trim().toLowerCase()) {
            let oldUuid =
              content.uuid ||
              content.contentUuid ||
              content.contentId ||
              content.contentItemUuid;
            if (!oldUuid) {
              const urlStr =
                content.buttonTargetUrl ||
                content.buttonProps?.targetURL ||
                content.externalUrl ||
                "";
              const uuidInUrl = urlStr.match(
                /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i
              );
              if (uuidInUrl) oldUuid = uuidInUrl[0];
            }
            if (oldUuid && oldUuid !== newUuid) {
              logger.info(
                `Replacing content UUID for "${cardLabel}": ${oldUuid} → ${newUuid}`
              );
              page.templateData = page.templateData.replace(
                new RegExp(oldUuid, "g"),
                newUuid
              );
            }
            break;
          }
        }
      }
    }
  } catch (e) {
    logger.warn(
      `Failed to parse templateData for custom content replacement: ${e.message}`
    );
  }

  page.childPages?.forEach((child) =>
    replaceContentUuidsRecursive(child, contentMap)
  );
}
