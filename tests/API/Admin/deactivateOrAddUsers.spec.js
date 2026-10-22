import { test, generateToken, logger, reusableFunctions, fs, inactiveUserInOrgForDeactivateSheetRow, loadTerminationDeactivateRowsFromFile, loadHireEmailsFromFile, swapPercipiodemoPlaceholderToHire, buildPercipiodemoPlaceholderEmail, fetchRoleUuid, createContentevalHireUser, hireFromSheetRow, config } from "../../../path.js";

/**
 * Sheet hire + terminate for Percipio Demo and Content Eval only.
 * File: FileName=<basename> under testData/terminationandnewHire/ (.xlsx first, else .csv).
 *
 * Row status (Business Process Name) — dates come from that same row's Effective Date:
 * - Hire / Hire Employee / Change Job → hire list
 * - Termination / End Contingent Worker Contract → terminate list
 * - Blank email, or any other status (e.g. Contract Contingent Worker) → skip, no API
 *
 * Same email on hire and terminate — later Effective Date wins (unique people are not date-checked):
 * - hire date > terminate date → hire only (do not deactivate)
 * - terminate date > hire date → terminate only (do not hire)
 * - dates equal or missing → no change for that person
 *
 * Hire action (user already in org vs not):
 * - missing → create (Percipio Demo: rename newuser_N; Content Eval: create Learning Admin)
 * - inactive → make active
 * - active → skip
 *
 * Terminate action: find user and set inactive.
 * Runs serial: deactivate list first, then hire list.
 */

const PERCIPIODEMO_ORIGIN = "https://percipiodemo.percipio.com";
const CONTENTEVAL_ORIGIN = "https://contenteval.percipio.com";
const terminationDataFolder = "testData/terminationandnewHire";

let jwt;

/** Same parser for `.csv` and `.xlsx`. Hire + termination rows share one sheet: set **`FileName=<basename>`** (no extension); first existing `basename.xlsx` then `basename.csv` under `terminationDataFolder`. */
const LOAD_SHEET_KIND = {
  termination: loadTerminationDeactivateRowsFromFile,
  hire: loadHireEmailsFromFile,
};

test.beforeAll(async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe.serial("UCM hire / terminate from sheet @deactivateOrAddUsers", () => {
  test("deactivate termination users @ucmDeactivateFromSheet", async ({ request }) => {
    test.setTimeout(3600000);
    let terminationRows = rowsFromSheet("termination");
    if (!terminationRows.length) {
      logger.info("No termination rows found");
      return;
    }
    await Promise.all(
      terminationRows.map((row) => inactiveUserInOrgForDeactivateSheetRow(request, jwt, row)),
    );
  });

  test("process hire rows — percipiodemo @ucmHireFromSheet", async ({ request }) => {
    test.setTimeout(3600000);
    test.skip(!hostnameMatchesSite(PERCIPIODEMO_ORIGIN), `Skipped: not percipiodemo`);

    let hireEmails = emailsFromSheet("hire");
    if (!hireEmails.length) {
      logger.info("No hire emails found");
      return;
    }

    let password = process.env.HIRE_PASSWORD || "Welcome1";
    let nextPlaceholderIndex = 0;
    for (let hireEmail of hireEmails) {
      await hireFromSheetRow(
        request,
        jwt,
        hireEmail,
        async () => {
          let placeholderEmail = buildPercipiodemoPlaceholderEmail(nextPlaceholderIndex);
          nextPlaceholderIndex += 1;
          await swapPercipiodemoPlaceholderToHire(
            request,
            jwt,
            placeholderEmail,
            hireEmail,
            password,
          );
        },
        password,
      );
    }
  });

  test("process hire rows — contenteval @ucmHireFromSheet", async ({ request }) => {
    test.setTimeout(3600000);
    test.skip(!hostnameMatchesSite(CONTENTEVAL_ORIGIN), `Skipped: not contenteval`);

    let hireEmails = emailsFromSheet("hire");
    if (!hireEmails.length) {
      logger.info("No hire emails found");
      return;
    }

    let roleUuid = await fetchRoleUuid(request, jwt, "LearningAdmin");
    if (!roleUuid) {
      logger.error("Cannot create users without roleUuid");
      return;
    }

    let password = process.env.HIRE_PASSWORD || "Welcome1";
    await Promise.all(
      hireEmails.map((hireEmail) =>
        hireFromSheetRow(
          request,
          jwt,
          hireEmail,
          () => createContentevalHireUser(request, jwt, hireEmail, password, roleUuid),
          password,
        ),
      ),
    );
  });
});

function hostnameMatchesSite(origin) {
  try {
    let configHost = new URL(config.get("Environment").baseURL).hostname.toLowerCase();
    let targetHost = new URL(origin).hostname.toLowerCase();
    return configHost === targetHost;
  } catch {
    return false;
  }
}

/** Resolve hire + termination sheet path (same file for deactivate rows and hire emails). */
function pathToHireTerminationSheet() {
  let name = (process.env.FileName || "").trim();
  if (!name) {
    return null;
  }
  let xlsxPath = reusableFunctions.getPath(terminationDataFolder, `${name}.xlsx`);
  let csvPath = reusableFunctions.getPath(terminationDataFolder, `${name}.csv`);
  if (fs.existsSync(xlsxPath)) {
    return xlsxPath;
  }
  if (fs.existsSync(csvPath)) {
    return csvPath;
  }
  logger.info(`No ${name}.xlsx or ${name}.csv under ${terminationDataFolder}`);
  return null;
}

function rowsFromSheet(kind) {
  let load = LOAD_SHEET_KIND[kind];
  let path = pathToHireTerminationSheet();
  if (!path) {
    logger.info("Set FileName=<basename> (no extension), e.g. FileName=hireAndTerminate — uses .xlsx if present, else .csv");
    return [];
  }
  return load(path);
}

function emailsFromSheet(kind) {
  return rowsFromSheet(kind);
}
