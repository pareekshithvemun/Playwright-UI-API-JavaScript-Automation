import fs from "fs";

// Titles to search for
const titlesToFind = [
  "Code of Conduct Breach",
  "Equal Employment Opportunity Violation",
  "Ethical Standards Violation",
  "Workplace Violence Event",
];

// Read the JSON file
const data = JSON.parse(fs.readFileSync("./testData/riskAreas.json", "utf8"));

// Build the mapping
const riskAreaMapping = {};

data.forEach((areaObj) => {
  const riskArea = areaObj.riskarea;
  const matchingTitles = [];

  areaObj.risks.forEach((risk) => {
    if (titlesToFind.includes(risk.title)) {
      matchingTitles.push(risk.title);
    }
  });

  if (matchingTitles.length > 0) {
    // If only one title, store as string; if multiple, store as array
    riskAreaMapping[riskArea] =
      matchingTitles.length === 1 ? matchingTitles[0] : matchingTitles;
  }
});

console.log("Risk Area to Title Mapping:");
console.log(JSON.stringify(riskAreaMapping, null, 2));

// Also show reverse mapping (title -> riskarea) for reference
console.log("\n\nTitle to Risk Area Mapping (for reference):");
const titleToRiskArea = {};
data.forEach((areaObj) => {
  areaObj.risks.forEach((risk) => {
    if (titlesToFind.includes(risk.title)) {
      titleToRiskArea[risk.title] = areaObj.riskarea;
    }
  });
});
console.log(JSON.stringify(titleToRiskArea, null, 2));
