import { expect } from "@playwright/test";
import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { searchAssetIdBody } from "../payloads/searchItemPayload.js";
import { logger } from "../../../logger.js";

export async function searchAssetInOrgApi(request, jwt, assetId) {
  try {
    const response = await request.post(urlData.searchContentUrl, {
      data: searchAssetIdBody(assetId),
      headers: headerData.searchContentHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const batch = await response.json();
    const searchData = (Array.isArray(batch) ? batch[0] : batch)?.data?.search;
    return searchData;
  } catch (error) {
    logger.error(
      `Search failed for asset ID ${assetId}: ${error.message || error}`,
    );
    throw error;
  }
}

/** Keep only rows whose contentId matches the searched asset UUID. */
export function classifyAssetSearchResult(searchData, assetId) {
  const wantAssetId = assetId.trim().toLowerCase();
  const results = searchData?.results ?? [];
  const resultCount = searchData?.resultCount ?? 0;

  if (!results.length || resultCount === 0) {
    return { found: false, reason: "no_results" };
  }

  const matched = results.find((row) => {
    const contentId = (row.contentId || row.contentUuid || "")
      .trim()
      .toLowerCase();
    return contentId === wantAssetId;
  });

  if (!matched) {
    return {
      found: false,
      reason: "contentId_mismatch",
      resultCount: results.length,
    };
  }

  return {
    found: true,
    contentType: matched.contentType,
    title: matched.title,
    contentId: matched.contentId || matched.contentUuid,
    category: matched.category,
  };
}
