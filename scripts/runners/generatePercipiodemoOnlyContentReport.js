const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const crossOrgPath = path.join(
  "testData/results",
  "asset-id-org-availability-cross-org-comparison.json",
);

const SECTION_CONFIG = {
  contentInPercipiodemoNotInPlatformtest: {
    reportTitle:
      "Content in Percipio Demo only — where it is used in the framework",
    reportSubtitle: "In Percipio Demo, missing from Platform Test",
    htmlFile: "content-in-percipiodemo-not-in-platformtest.html",
    pdfFile: "content-in-percipiodemo-not-in-platformtest.pdf",
  },
  contentInBothOrgs: {
    reportTitle:
      "Content in both Percipio Demo and Platform Test — where it is used in the framework",
    reportSubtitle: "Available in both orgs",
    htmlFile: "content-in-both-orgs.html",
    pdfFile: "content-in-both-orgs.pdf",
  },
  contentNotInEitherOrg: {
    reportTitle:
      "Content not in Percipio Demo or Platform Test — where it is used in the framework",
    reportSubtitle: "Not found in either org",
    htmlFile: "content-not-in-either-org.html",
    pdfFile: "content-not-in-either-org.pdf",
  },
};

const excludedPathParts = [
  `${path.sep}testData${path.sep}assetid${path.sep}`,
  `${path.sep}testData${path.sep}jenkins${path.sep}`,
  `${path.sep}testData${path.sep}orgsData${path.sep}`,
  `${path.sep}testData${path.sep}usersData${path.sep}`,
  `${path.sep}testData${path.sep}results${path.sep}`,
];

function normalizeUuid(value) {
  return String(value || "").trim().toLowerCase();
}

function isUuid(value) {
  return UUID_REGEX.test(normalizeUuid(value));
}

function addAssetMetadata(metadataIndex, assetId, metadata) {
  const key = normalizeUuid(assetId);
  if (!key) {
    return;
  }

  const current = metadataIndex.get(key) || {};
  metadataIndex.set(key, {
    title: metadata.title || current.title,
    contentType: metadata.contentType || current.contentType,
    category: metadata.category || current.category,
  });
}

function buildAssetMetadataIndex() {
  const metadataIndex = new Map();
  const contentJsPath = path.join(process.cwd(), "testData/content/content.js");

  if (fs.existsSync(contentJsPath)) {
    const fileText = fs.readFileSync(contentJsPath, "utf8");
    for (const match of fileText.matchAll(
      /id:\s*["']([0-9a-f-]{36})["'][\s\S]{0,500}?title:\s*["']([^"']+)["']/gi,
    )) {
      addAssetMetadata(metadataIndex, match[1], { title: match[2] });
    }
    for (const match of fileText.matchAll(
      /id:\s*["']([0-9a-f-]{36})["'][\s\S]{0,500}?contentType:\s*["']([^"']+)["']/gi,
    )) {
      addAssetMetadata(metadataIndex, match[1], { contentType: match[2] });
    }
  }

  const playlistPath = path.join(
    process.cwd(),
    "testData/PlayListData/playListDataOne.json",
  );
  if (fs.existsSync(playlistPath)) {
    const playlistData = JSON.parse(fs.readFileSync(playlistPath, "utf8"));
    for (const playlist of playlistData.PLAYLISTDATA || []) {
      for (const item of playlist.playListContent || []) {
        if (!isUuid(item.contentItemUuid)) {
          continue;
        }
        addAssetMetadata(metadataIndex, item.contentItemUuid, {
          title: item.contentItemTitle,
          contentType: item.contentItemTypeName,
        });
      }
    }
  }

  const bannerPath = path.join(process.cwd(), "testData/BannerData/bannerDataTwo.json");
  if (fs.existsSync(bannerPath)) {
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, "utf8"));
    for (const banner of bannerData.BannerData || []) {
      const assetId = banner.contentUUID || banner.contentUuid;
      if (!isUuid(assetId)) {
        continue;
      }
      addAssetMetadata(metadataIndex, assetId, {
        title: banner.BannerName,
        contentType: banner.ContentType,
      });
    }
  }

  return metadataIndex;
}

function addLocation(index, assetId, location) {
  const key = normalizeUuid(assetId);
  if (!key || !location?.label) {
    return;
  }
  if (!index.has(key)) {
    index.set(key, []);
  }
  const existing = index.get(key);
  const duplicate = existing.some(
    (row) =>
      row.label === location.label &&
      row.sourceFile === location.sourceFile &&
      row.contextType === location.contextType,
  );
  if (!duplicate) {
    existing.push(location);
  }
}

function walkObject(node, visit) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walkObject(item, visit);
    }
    return;
  }
  if (node && typeof node === "object") {
    visit(node);
    for (const value of Object.values(node)) {
      walkObject(value, visit);
    }
  }
}

function indexAreaTestData(data, sourceFile, index) {
  for (const area of data?.testData || []) {
    const areaName = area.AreaName;
    for (const subject of area.Subjects || []) {
      const subjectName = subject.SubJectName || subject.SubjectName;

      for (const contentId of subject.Content || []) {
        if (isUuid(contentId)) {
          addLocation(index, contentId, {
            contextType: "subject_channel",
            label: `Area: ${areaName} → Subject: ${subjectName} → Subject channel/content list`,
            sourceFile,
          });
        }
      }

      for (const journey of subject.CustomJournies || []) {
        const journeyName = journey.JourneyName;
        for (const track of journey.Tracks || []) {
          const trackName = track.trackName;
          for (const item of track.trackContent || []) {
            const assetId = item.contentItemUuid;
            if (!isUuid(assetId)) {
              continue;
            }
            addLocation(index, assetId, {
              contextType: "journey_track",
              label: `Area: ${areaName} → Subject: ${subjectName} → Journey: ${journeyName} → Track: ${trackName}`,
              sourceFile,
            });
          }
        }
      }
    }
  }
}

function indexChannelData(data, sourceFile, index) {
  for (const channel of data?.channelsInfo || []) {
    const channelName = channel.channelName;
    const areaName = channel.AreaName || "—";
    const subjectNames = (channel.SubjectName || []).join(", ") || "—";

    for (const item of channel.channelContent || []) {
      const assetId = item.contentItemUuid;
      if (!isUuid(assetId)) {
        continue;
      }
      addLocation(index, assetId, {
        contextType: "custom_channel",
        label: `Channel: ${channelName} → Area: ${areaName} → Subject: ${subjectNames}`,
        sourceFile,
      });
    }
  }
}

function indexJourneyData(data, sourceFile, index) {
  for (const journey of data?.journeyData || []) {
    const journeyTitle = journey.journeyTitle;
    for (const track of journey.trackData || []) {
      const trackTitle = track.trackTitle;
      for (const item of track.contentItems || []) {
        const assetId = item.contentItemUuid;
        if (!isUuid(assetId)) {
          continue;
        }
        addLocation(index, assetId, {
          contextType: "standalone_journey",
          label: `Journey: ${journeyTitle} → Track: ${trackTitle}`,
          sourceFile,
        });
      }
    }
  }
}

function indexAssignmentData(data, sourceFile, index) {
  for (const assignment of data?.contentForAssignment || []) {
    const assignmentName = assignment.name;
    for (const item of assignment.content || []) {
      const assetId = item.contentId || item.contentUUID || item.contentUuid;
      if (!isUuid(assetId)) {
        continue;
      }
      addLocation(index, assetId, {
        contextType: "assignment",
        label: `Assignment: ${assignmentName}`,
        sourceFile,
      });
    }
  }
}

function indexStripData(data, sourceFile, index) {
  for (const strip of data?.StripsData || []) {
    const stripTitle = strip.TitleOfStrip;
    for (const item of strip.contentOfStrip || []) {
      const assetId = item.contentItemUuid;
      if (!isUuid(assetId)) {
        continue;
      }
      addLocation(index, assetId, {
        contextType: "strip",
        label: `Homepage strip: ${stripTitle}`,
        sourceFile,
      });
    }
  }
}

function indexCertificationPaths(data, sourceFile, index) {
  const journeys = data?.certificationPathData || data?.testData || data;
  if (!Array.isArray(journeys)) {
    return;
  }

  for (const journey of journeys) {
    const journeyName = journey.JourneyName || journey.journeyTitle;
    for (const track of journey.Tracks || journey.trackData || []) {
      const trackName = track.trackName || track.trackTitle;
      const contentItems =
        track.trackContent || track.contentItems || track.content || [];
      for (const item of contentItems) {
        const assetId =
          typeof item === "string"
            ? item
            : item.contentItemUuid || item.contentId || item.contentUUID;
        if (!isUuid(assetId)) {
          continue;
        }
        addLocation(index, assetId, {
          contextType: "certification_journey",
          label: `Certification journey: ${journeyName} → Track: ${trackName}`,
          sourceFile,
        });
      }
    }
  }
}

function indexBadgesData(data, sourceFile, index) {
  const badgeGroups = data?.earnBadgesData || data?.testData || [];
  for (const group of badgeGroups) {
    for (const journey of group.Journeys || group.CustomJournies || []) {
      const journeyName = journey.JourneyName || journey.journeyTitle;
      walkObject(journey, (node) => {
        const assetId =
          node.contentItemUuid || node.contentId || node.contentUUID;
        if (!isUuid(assetId)) {
          return;
        }
        addLocation(index, assetId, {
          contextType: "badge_journey",
          label: `Badge journey: ${journeyName}`,
          sourceFile,
        });
      });
    }
  }
}

function collectLandingPagePaths(pages, parentPath = "") {
  const rows = [];
  for (const page of pages || []) {
    const pagePath = parentPath
      ? `${parentPath} → ${page.title}`
      : page.title;
    rows.push({ page, pagePath });

    if (page.childPages?.length) {
      rows.push(...collectLandingPagePaths(page.childPages, pagePath));
    }
  }
  return rows;
}

function indexCustomLandingPages(data, sourceFile, index) {
  const pages = Array.isArray(data) ? data : [data];
  const landingPages = collectLandingPagePaths(pages);

  for (const { page, pagePath } of landingPages) {
    if (!page.templateData) {
      continue;
    }

    let template;
    try {
      template =
        typeof page.templateData === "string"
          ? JSON.parse(page.templateData)
          : page.templateData;
    } catch {
      continue;
    }

    for (const placedItem of template.placedItems || []) {
      const content = placedItem.content || {};
      const assetId =
        content.contentUuid ||
        content.contentId ||
        content.contentItemUuid ||
        content.uuid;
      if (!isUuid(assetId)) {
        continue;
      }

      const cardTitle = content.title || content.heading || "Landing page card";
      addLocation(index, assetId, {
        contextType: "custom_landing_page",
        label: `Custom landing page: ${pagePath} → Card: ${cardTitle}`,
        sourceFile,
      });
    }
  }
}

function indexPlayListData(data, sourceFile, index) {
  for (const playlist of data?.PLAYLISTDATA || []) {
    const playListName = playlist.playListName;
    for (const item of playlist.playListContent || []) {
      const assetId = item.contentItemUuid;
      if (!isUuid(assetId)) {
        continue;
      }
      const itemTitle = item.contentItemTitle ? ` (${item.contentItemTitle})` : "";
      addLocation(index, assetId, {
        contextType: "playlist",
        label: `Playlist: ${playListName}${itemTitle}`,
        sourceFile,
      });
    }
  }
}

function indexBannerData(data, sourceFile, index) {
  for (const banner of data?.BannerData || []) {
    const assetId = banner.contentUUID || banner.contentUuid;
    if (!isUuid(assetId)) {
      continue;
    }
    addLocation(index, assetId, {
      contextType: "banner",
      label: `Banner: ${banner.BannerName} (${banner.BannerLocale || "locale n/a"})`,
      sourceFile,
    });
  }
}

function indexLearningPrograms(data, sourceFile, index) {
  for (const program of data?.learningPrograms || []) {
    const programTitle = program.lptitle;
    for (const item of program.lpcontents || []) {
      const assetId = item.contentId || item.contentUUID;
      if (!isUuid(assetId)) {
        continue;
      }
      addLocation(index, assetId, {
        contextType: "learning_program",
        label: `Learning program: ${programTitle}`,
        sourceFile,
      });
    }
  }
}

function indexDynamicContent(data, sourceFile, index) {
  const dynamicItems = Array.isArray(data) ? data : [data];
  for (const dynamicItem of dynamicItems) {
    const dynamicTitle = dynamicItem.dynamicContentTitle || "Dynamic content";
    for (const answerBlock of dynamicItem.contentForEachAnswer || []) {
      const answerPath = `${answerBlock.question} → ${answerBlock.answer}`;
      for (const mapped of answerBlock.mappedContent || []) {
        for (const item of mapped.content || []) {
          const assetId = item.contentId || item.contentUUID;
          if (!isUuid(assetId)) {
            continue;
          }
          addLocation(index, assetId, {
            contextType: "dynamic_content",
            label: `Dynamic content: ${dynamicTitle} → ${answerPath}`,
            sourceFile,
          });
        }
      }
    }
  }
}

function indexContentJs(fileText, sourceFile, index) {
  const idMatches = fileText.matchAll(
    /id:\s*["']([0-9a-f-]{36})["'][\s\S]{0,250}?title:\s*["']([^"']+)["']/gi,
  );
  for (const match of idMatches) {
    addLocation(index, match[1], {
      contextType: "content_registry",
      label: `Content registry (content.js): ${match[2]}`,
      sourceFile,
    });
  }

  const journeyMatches = fileText.matchAll(
    /["']([0-9a-f-]{36})["']/gi,
  );
  for (const match of journeyMatches) {
    if (!isUuid(match[1])) {
      continue;
    }
    if (fileText.includes(`id: "${match[1]}"`) || fileText.includes(`id: '${match[1]}'`)) {
      continue;
    }
  }
}

function indexGenericJson(data, sourceFile, index) {
  walkObject(data, (node) => {
    const assetId =
      node.assetId ||
      node.contentId ||
      node.contentUUID ||
      node.contentUuid ||
      node.contentItemUuid ||
      node.contentItemId ||
      node.courseId ||
      node.externalCourseId;

    if (!isUuid(assetId)) {
      return;
    }

    const nearbyTitle =
      node.title ||
      node.name ||
      node.channelName ||
      node.JourneyName ||
      node.journeyTitle ||
      node.AreaName ||
      node.SubJectName ||
      node.SubjectName;

    if (nearbyTitle) {
      addLocation(index, assetId, {
        contextType: "generic_json",
        label: `${path.basename(sourceFile)}: ${nearbyTitle}`,
        sourceFile,
      });
    }
  });
}

function indexFile(relativePath, index) {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) {
    return;
  }

  const sourceFile = relativePath.replace(/\\/g, "/");

  if (relativePath.endsWith(".js")) {
    const fileText = fs.readFileSync(absolutePath, "utf8");
    indexContentJs(fileText, sourceFile, index);
    return;
  }

  if (!relativePath.endsWith(".json")) {
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    return;
  }

  if (sourceFile.includes("AreaTestData/")) {
    indexAreaTestData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("channelTestData/")) {
    indexChannelData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("JourneyTestData/")) {
    indexJourneyData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("AssignmentTestData/")) {
    indexAssignmentData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("StripData/")) {
    indexStripData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("certificationPaths/")) {
    indexCertificationPaths(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("badgesTestData/")) {
    indexBadgesData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("customLandingPages/")) {
    indexCustomLandingPages(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("PlayListData/")) {
    indexPlayListData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("BannerData/")) {
    indexBannerData(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("learningPrograms/")) {
    indexLearningPrograms(data, sourceFile, index);
    return;
  }
  if (sourceFile.includes("DynamicContent/")) {
    indexDynamicContent(data, sourceFile, index);
    return;
  }

  indexGenericJson(data, sourceFile, index);
}

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedPathParts.some((part) => `${fullPath}${path.sep}`.includes(part))) {
        continue;
      }
      collectFiles(fullPath, files);
      continue;
    }

    if (!/\.(json|js)$/.test(entry.name)) {
      continue;
    }

    const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
    if (excludedPathParts.some((part) => relativePath.includes(part.replace(/\\/g, "/")))) {
      continue;
    }

    if (relativePath.startsWith("tests/") || relativePath.startsWith("testData/")) {
      files.push(relativePath);
    }
  }
  return files;
}

function buildLocationIndex() {
  const index = new Map();
  const files = [
    ...collectFiles(path.join(process.cwd(), "testData")),
    ...collectFiles(path.join(process.cwd(), "tests")),
  ];

  for (const file of files) {
    indexFile(file, index);
  }

  return index;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(report, rows, sectionConfig) {
  const generatedAt = new Date(report.generatedAt).toLocaleString();
  const percipiodemoUrl = report.orgs?.percipiodemo?.baseURL || "";
  const platformtestUrl = report.orgs?.platformtest?.baseURL || "";

  const tableRows = rows
    .map((row, index) => {
      const locationsHtml = row.locations.length
        ? `<ul class="locations">${row.locations
            .map((location) => `<li>${escapeHtml(location)}</li>`)
            .join("")}</ul>`
        : `<span class="missing">No mapped location found in framework test data</span>`;

      return `
        <tr>
          <td class="num">${index + 1}</td>
          <td class="title">${escapeHtml(row.title)}</td>
          <td class="uuid"><code>${escapeHtml(row.contentId)}</code></td>
          <td class="type">${escapeHtml(row.contentType || "—")} / ${escapeHtml(row.category || "—")}</td>
          <td class="locations-cell">${locationsHtml}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(sectionConfig.reportTitle)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.4;
      padding: 20px;
    }
    header {
      border-bottom: 3px solid #2563eb;
      margin-bottom: 18px;
      padding-bottom: 10px;
    }
    h1 { margin: 0 0 8px; font-size: 1.45rem; }
    .meta { color: #6b7280; font-size: 0.9rem; margin: 3px 0; }
    .count { margin-top: 8px; font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 7px 8px;
      vertical-align: top;
      text-align: left;
    }
    th { background: #eff6ff; }
    .num { width: 34px; text-align: center; color: #6b7280; }
    .uuid { width: 250px; }
    .type { width: 130px; }
    .uuid code { font-size: 0.76rem; word-break: break-all; }
    .locations { margin: 0; padding-left: 16px; }
    .locations li { margin-bottom: 4px; }
    .missing { color: #b45309; font-style: italic; }
    tr { break-inside: avoid; page-break-inside: avoid; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(sectionConfig.reportTitle)}</h1>
    <p class="meta">${escapeHtml(sectionConfig.reportSubtitle)}</p>
    <p class="meta">Percipio Demo: ${escapeHtml(percipiodemoUrl)}</p>
    <p class="meta">Platform Test: ${escapeHtml(platformtestUrl)}</p>
    <p class="meta">Report generated: ${escapeHtml(generatedAt)}</p>
    <p class="count">${rows.length} content item(s)</p>
  </header>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Content UUID</th>
        <th>Type</th>
        <th>Where used in framework (human readable)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;
}

async function writePdfFromHtml(absoluteHtmlPath, absolutePdfPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: absolutePdfPath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  });
  await browser.close();
}

function getItemsForSection(report, sectionKey, metadataIndex) {
  if (sectionKey === "contentInBothOrgs") {
    return (report.contentInBothOrgs || []).map((row) => {
      const meta = row.percipiodemo || row.platformtest || {};
      return {
        title: meta.title || "—",
        contentId: row.assetId,
        contentType: meta.contentType,
        category: meta.category,
      };
    });
  }

  if (sectionKey === "contentNotInEitherOrg") {
    return (report.contentNotInEitherOrg || []).map((assetId) => {
      const meta = metadataIndex.get(normalizeUuid(assetId)) || {};
      return {
        title: meta.title || "Title not available (not found in org search)",
        contentId: assetId,
        contentType: meta.contentType || "—",
        category: meta.category || "—",
      };
    });
  }

  return report.contentInPercipiodemoNotInPlatformtest || [];
}

async function main() {
  const sectionKey =
    process.argv[2] || "contentInPercipiodemoNotInPlatformtest";
  const sectionConfig = SECTION_CONFIG[sectionKey];

  if (!sectionConfig) {
    throw new Error(
      `Unknown section "${sectionKey}". Use one of: ${Object.keys(SECTION_CONFIG).join(", ")}`,
    );
  }

  const htmlPath = path.join("testData/results", sectionConfig.htmlFile);
  const pdfPath = path.join("testData/results", sectionConfig.pdfFile);
  const report = JSON.parse(fs.readFileSync(crossOrgPath, "utf8"));
  const metadataIndex = buildAssetMetadataIndex();
  const items = getItemsForSection(report, sectionKey, metadataIndex);
  const locationIndex = buildLocationIndex();

  const rows = items.map((item) => {
    const key = normalizeUuid(item.assetId || item.contentId);
    const locations = [...new Set((locationIndex.get(key) || []).map((row) => row.label))];
    return {
      title: item.title,
      contentId: item.contentId || item.assetId,
      contentType: item.contentType,
      category: item.category,
      locations,
    };
  });

  const missingCount = rows.filter((row) => row.locations.length === 0).length;

  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, buildHtml(report, rows, sectionConfig));

  const absoluteHtmlPath = path.resolve(htmlPath);
  const absolutePdfPath = path.resolve(pdfPath);
  await writePdfFromHtml(absoluteHtmlPath, absolutePdfPath);

  console.log(`HTML written to ${htmlPath}`);
  console.log(`PDF written to ${pdfPath}`);
  console.log(`Rows: ${rows.length}`);
  console.log(`Rows with mapped locations: ${rows.length - missingCount}`);
  console.log(`Rows without mapped locations: ${missingCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
