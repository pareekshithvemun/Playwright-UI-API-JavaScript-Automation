/**
 * Converts sample.json (API response) to test data format
 *
 * IMPORTANT: These functions are IDENTICAL to those in helpers/UI/commonFunctions.js:
 *   - reusableFunctions.convertApiResponseToTestData()
 *   - reusableFunctions.replaceUrlsWithPlaceholders()
 *
 * They are duplicated here only to avoid import/logger issues in standalone script.
 * Use the commonFunctions.js versions in your test code!
 */

import fs from "fs";

/**
 * Converts API response to test data format
 * SAME as reusableFunctions.convertApiResponseToTestData()
 */
const convertApiResponseToTestData = (apiResponse) => {
  const excludeFields = [
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
      if (!excludeFields.includes(key)) {
        cleaned[key] =
          key === "childPages" && Array.isArray(value)
            ? value.map((child) => cleanPage(child))
            : value;
      }
    }
    return cleaned;
  }

  return [cleanPage(apiResponse)];
};

/**
 * Replaces URLs with {{CHILD_PAGE:Title}} placeholders
 * SAME as reusableFunctions.replaceUrlsWithPlaceholders()
 */
const replaceUrlsWithPlaceholders = (page, titleMap = null) => {
  if (!titleMap) {
    titleMap = new Map();
    function buildTitleMap(p) {
      if (p.pageUuid) titleMap.set(p.pageUuid, p.title);
      p.childPages?.forEach((child) => buildTitleMap(child));
    }
    buildTitleMap(page);
  }

  if (page.templateData?.includes("/custom-pages/")) {
    page.templateData = page.templateData.replace(
      /https?:\/\/[^/]+\/custom-pages\/[a-f0-9-]+\/([a-f0-9-]+)/g,
      (match, targetUuid) => {
        const targetTitle = titleMap.get(targetUuid);
        if (targetTitle) {
          console.log(`   🔄 Replaced URL with {{CHILD_PAGE:${targetTitle}}}`);
          return `{{CHILD_PAGE:${targetTitle}}}`;
        }
        return match;
      }
    );
  }

  page.childPages?.forEach((child) =>
    replaceUrlsWithPlaceholders(child, titleMap)
  );
  return page;
};

// Configuration (run from project root: node scripts/runners/convertSampleToTestData.js)
const inputFile = "testData/customLandingPages/sampleApiResponse.json";
const outputFile = "testData/customLandingPages/convertedTestData.json";
const replaceDynamicUrls = true; // Set to true to replace URLs with {{CHILD_PAGE:...}}

// Run conversion
try {
  console.log(`\n📖 Reading from: ${inputFile}`);
  const apiResponse = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  if (replaceDynamicUrls) {
    console.log(
      `\n🔄 Replacing hardcoded URLs with {{CHILD_PAGE:...}} placeholders...`
    );
    replaceUrlsWithPlaceholders(apiResponse);
  }

  const testData = convertApiResponseToTestData(apiResponse);

  console.log(`\n✅ Converted to test data format`);
  console.log(
    `   - Removed: pageUuid, createdBy, modifiedBy, createdDate, modifiedDate, parentPageUuid`
  );
  console.log(`   - Format: Wrapped in array [ {...} ]`);

  fs.writeFileSync(outputFile, JSON.stringify(testData, null, 2));

  console.log(`\n✅ Conversion successful!`);
  console.log(`📝 Output saved to: ${outputFile}\n`);

  if (!replaceDynamicUrls) {
    console.log(
      `💡 Tip: Set replaceDynamicUrls = true to replace URLs with {{CHILD_PAGE:...}}\n`
    );
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
