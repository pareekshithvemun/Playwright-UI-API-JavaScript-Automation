import fs from "fs";
import {
  classifyAssetSearchResult,
  config,
  generateToken,
  logger,
  reusableFunctions,
  searchAssetInOrgApi,
  test,
} from "../../../path.js";

const PARALLEL_CHUNK_COUNT = 10;

const orgEnvironment = config.get("Environment");
const orgId = orgEnvironment.orgId;

const assetInventoryPath = reusableFunctions.getPath(
  "testData/assetid",
  "asset-ids-framework-unique.json",
);
const outputPath = reusableFunctions.getPath(
  "testData/results",
  `asset-id-org-availability-${orgId}.json`,
);
const resultsScratchPath = reusableFunctions.getPath(
  "testData/results",
  `asset-id-org-availability-${orgId}.scratch.jsonl`,
);
const resultsDir = reusableFunctions.getPath("testData/results", "");

const assetInventory =
  reusableFunctions.readDatafromJsonFilenotasync(assetInventoryPath);
const assetIds = assetInventory.assetIds || [];

const chunkSize = Math.ceil(assetIds.length / PARALLEL_CHUNK_COUNT);
const assetIdChunks = [];
for (let index = 0; index < assetIds.length; index += chunkSize) {
  assetIdChunks.push(assetIds.slice(index, index + chunkSize));
}

let jwt;

function classificationToRow(assetId, classification) {
  if (classification.found) {
    return {
      assetId,
      found: true,
      contentType: classification.contentType,
      title: classification.title,
      contentId: classification.contentId,
      category: classification.category,
    };
  }

  return {
    assetId,
    found: false,
    reason: classification.reason,
  };
}

function logClassification(assetId, classification) {
  if (classification.found) {
    logger.info(
      `Content in org for asset ${assetId} with contentId ${classification.contentId} (${classification.contentType}: ${classification.title})`,
    );
    return;
  }

  logger.info(`Content not in org for asset ${assetId} (${classification.reason})`);
}

function appendResultRow(row) {
  fs.appendFileSync(resultsScratchPath, `${JSON.stringify(row)}\n`);
}

function buildReportFromRows(rows) {
  const contentInOrg = [];
  const contentNotInOrg = [];

  for (const row of rows) {
    if (row.found) {
      contentInOrg.push({
        assetId: row.assetId,
        contentType: row.contentType,
        title: row.title,
        contentId: row.contentId,
        category: row.category,
      });
    } else {
      contentNotInOrg.push(row.assetId);
    }
  }

  contentInOrg.sort((a, b) => a.assetId.localeCompare(b.assetId));
  contentNotInOrg.sort();

  return {
    description:
      "Org search availability for framework asset IDs using graphql3 search API.",
    generatedAt: new Date().toISOString(),
    org: {
      baseURL: orgEnvironment.baseURL,
      orgId: orgEnvironment.orgId,
    },
    sourceAssetList: assetInventoryPath,
    totalChecked: assetIds.length,
    resultsChecked: rows.length,
    contentInOrgCount: contentInOrg.length,
    contentNotInOrgCount: contentNotInOrg.length,
    contentInOrg,
    contentNotInOrg,
  };
}

function readScratchRows() {
  if (!fs.existsSync(resultsScratchPath)) {
    return [];
  }

  return fs
    .readFileSync(resultsScratchPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function waitForAllSearchResults() {
  const deadlineMs = Date.now() + 30 * 60 * 1000;

  while (Date.now() < deadlineMs) {
    const rows = readScratchRows();
    if (rows.length >= assetIds.length) {
      return rows;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return readScratchRows();
}

test.beforeAll(async ({ request }) => {
  fs.mkdirSync(resultsDir, { recursive: true });

  if (fs.existsSync(resultsScratchPath)) {
    fs.unlinkSync(resultsScratchPath);
  }

  jwt = await generateToken(request);
  logger.info(
    `Loaded ${assetIds.length} framework asset IDs in ${assetIdChunks.length} parallel chunks; results will be written to ${outputPath}`,
  );
});

test.describe.configure({ mode: "parallel" });

for (let chunkIndex = 0; chunkIndex < assetIdChunks.length; chunkIndex++) {
  const chunkAssetIds = assetIdChunks[chunkIndex];

  test(`search asset chunk ${chunkIndex + 1}/${assetIdChunks.length}`, async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(30 * 60 * 1000);

    for (const assetId of chunkAssetIds) {
      const searchData = await searchAssetInOrgApi(request, jwt, assetId);
      const classification = classifyAssetSearchResult(searchData, assetId);
      logClassification(assetId, classification);
      appendResultRow(classificationToRow(assetId, classification));
    }
  });
}

test(`write asset-id-org-availability-${orgId}.json`, async () => {
  test.setTimeout(35 * 60 * 1000);

  const rows = await waitForAllSearchResults();
  const report = buildReportFromRows(rows);

  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  if (fs.existsSync(resultsScratchPath)) {
    fs.unlinkSync(resultsScratchPath);
  }

  logger.info(
    `Org availability report written to ${outputPath} (checked: ${report.resultsChecked}/${report.totalChecked}, in org: ${report.contentInOrgCount}, not in org: ${report.contentNotInOrgCount})`,
  );

  if (report.resultsChecked < report.totalChecked) {
    throw new Error(
      `Incomplete org availability report: ${report.resultsChecked}/${report.totalChecked} asset IDs checked`,
    );
  }
});
