/**
 * Monthly cron helper: inactivate external users on every site in the list.
 *
 * Flow (simple):
 * 1) Read site list (URL + orgId) + shared admin
 * 2) Figure out which month to clean (today in IST, minus 2 months)
 * 3) For each site: write config/runtimeOrg.json, then run the playwright spec
 *
 * Add a new site later = add one row in monthlyExternalUserSites.json (no new config file).
 *
 * npm: npm run ucmInactivateExternalUsersMonthlyCron
 * Optional overrides: USERS_EXPORT_MONTH / USERS_EXPORT_YEAR (skip auto month math)
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SITES_FILE = path.join(
  REPO_ROOT,
  "testData/orgsData/monthlyExternalUserSites.json",
);
const RUNTIME_CONFIG = path.join(REPO_ROOT, "config/runtimeOrg.json");
const SPEC_PATH =
  "tests/API/Admin/ucmInactivateExternalUsersFromSiteForMonth.spec.js";

// Read the site list file (names, urls, org ids, shared admin password).
function loadSitesFile() {
  const raw = fs.readFileSync(SITES_FILE, "utf8");
  return JSON.parse(raw);
}

// "What day/time is it in India right now?" → used so month math matches IST cron.
function getNowInIst() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
}

// Target month = current IST month minus 2 (Aug→Jun; Jan→Nov last year; Feb→Dec last year).
function getExportMonthAndYearMinusTwo() {
  const istNow = getNowInIst();
  let month = istNow.getMonth() + 1;
  let year = istNow.getFullYear();
  month -= 2;
  if (month <= 0) {
    month += 12;
    year -= 1;
  }
  return { month, year };
}

// Write a tiny config file so NODE_ENV=runtimeOrg points at this site.
function writeRuntimeOrgConfig(site, sharedAdmin) {
  const body = {
    dynamic: true,
    Environment: {
      baseURL: site.baseURL,
      orgId: site.orgId,
      attributeName: ["Region", "Department", "Job Title"],
    },
    Admindata: {
      loginID: sharedAdmin.loginID,
      password: sharedAdmin.password,
    },
  };
  fs.writeFileSync(RUNTIME_CONFIG, JSON.stringify(body, null, 2));
  console.log(
    `Wrote config/runtimeOrg.json for ${site.name} (${site.baseURL})`,
  );
}

// Run the real inactivate spec once for the current runtimeOrg config.
function runInactivateSpec(month, year) {
  const result = spawnSync(
    "npx",
    ["playwright", "test", SPEC_PATH],
    {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "runtimeOrg",
        USERS_EXPORT_MONTH: String(month),
        USERS_EXPORT_YEAR: String(year),
      },
      shell: true,
    },
  );
  return result.status === 0;
}

function main() {
  const data = loadSitesFile();
  const sites = data.sites || [];
  const sharedAdmin = data.sharedAdmin;

  if (!Array.isArray(sites) || sites.length === 0) {
    console.error("No sites listed in monthlyExternalUserSites.json");
    process.exit(1);
  }
  if (!sharedAdmin?.loginID || !sharedAdmin?.password) {
    console.error("sharedAdmin loginID/password missing in monthlyExternalUserSites.json");
    process.exit(1);
  }

  // Allow manual override; otherwise auto-pick month = IST now − 2.
  const auto = getExportMonthAndYearMinusTwo();
  const month = process.env.USERS_EXPORT_MONTH || auto.month;
  const year = process.env.USERS_EXPORT_YEAR || auto.year;
  console.log(
    `Export filter month/year: ${month}/${year} (IST auto was ${auto.month}/${auto.year})`,
  );

  let failed = 0;
  for (const site of sites) {
    console.log(`\n========== Site: ${site.name} ==========`);
    writeRuntimeOrgConfig(site, sharedAdmin);
    const ok = runInactivateSpec(month, year);
    if (!ok) {
      failed += 1;
      console.error(`FAILED for site ${site.name}`);
    } else {
      console.log(`OK for site ${site.name}`);
    }
  }

  if (failed > 0) {
    console.error(`Done with ${failed} site failure(s) out of ${sites.length}`);
    process.exit(1);
  }
  console.log(`\nAll ${sites.length} site(s) finished OK`);
}

main();
