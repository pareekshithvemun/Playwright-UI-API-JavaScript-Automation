import fs from "fs";
import { basename } from "node:path";
import XLSX from "xlsx";
import { logger } from "../../logger.js";

/**
 * Hire/termination CSV or XLSX. Set **`FileName=<basename>`** (no extension) under **`testData/terminationandnewHire/`**.
 * Columns: **Email ID** (or Email), **Business Process Name** (or Business Process), optional names and **Effective Date**.
 * - Hire / Hire Employee / Change Job → hire list (look up → skip if active / reactivate if inactive / create if missing).
 * - Termination / End Contingent Worker Contract → deactivate list.
 * - Same email on both: later Effective Date wins. Hire later → hire only (do not deactivate). Terminate later → terminate only.
 * - Any other status (including Contract Contingent Worker) → skip, no API change.
 */

/** @typedef {'hire' | 'termination' | 'ignore'} BusinessProcessKind */

const HIRE_PROCESS_NAMES = new Set([
  "hire",
  "hire employee",
  "change job",
  "changejob",
]);

const DEACTIVATION_PROCESS_NAMES = new Set([
  "termination",
  "end contingent worker contract",
]);

// ===================== Helper Functions =====================

// Same compare for headers and process names: trim + lowercase.
function normalizeCellText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

// Sheet Business Process Name → hire, terminate, or ignore.
export function classifyBusinessProcessName(value) {
  const processName = normalizeCellText(value);
  if (HIRE_PROCESS_NAMES.has(processName)) return "hire";
  if (DEACTIVATION_PROCESS_NAMES.has(processName)) return "termination";
  return "ignore";
}

// Open the first sheet as rows of cells.
function readSpreadsheetRows(filePath) {
  if (!fs.existsSync(filePath)) {
    logger.error(`File not found: ${basename(filePath)}`);
    return [];
  }
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

// Find the real header row (title rows above it have no Email + Business Process).
function findHeaderRowInfo(rows) {
  for (let i = 0; i < rows.length; i++) {
    const headers = rows[i].map((cell) => normalizeCellText(cell));
    const emailIdx = headers.findIndex(
      (h) => h === "email id" || h === "email" || h.includes("email"),
    );
    const procIdx = headers.findIndex(
      (h) => h === "business process name" || h === "business process",
    );
    if (emailIdx < 0 || procIdx < 0) continue;
    return {
      headerRowIndex: i,
      emailIdx,
      procIdx,
      firstIdx: headers.findIndex(
        (h) => h === "first name" || h === "firstname" || h === "given name",
      ),
      lastIdx: headers.findIndex(
        (h) =>
          h === "last name" ||
          h === "lastname" ||
          h === "surname" ||
          h === "family name",
      ),
      dateIdx: headers.findIndex((h) => h === "effective date"),
    };
  }
  return null;
}

function cellText(row, columnIndex) {
  if (columnIndex < 0) return "";
  return String(row[columnIndex] ?? "").trim();
}

// Turn Effective Date into a number we can compare. XLSX often gives a day number; a bigger number is a later day.
function dateToNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getFullYear() * 10000 + (value.getMonth() + 1) * 100 + value.getDate();
  }
  const parts = String(value ?? "").trim().split("/");
  if (parts.length !== 3) return 0;
  const month = Number(parts[0]);
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  if (!year || !month || !day) return 0;
  return year * 10000 + month * 100 + day;
}

function keepLaterDate(dateByEmail, email, dateNumber) {
  const current = dateByEmail.get(email) || 0;
  if (dateNumber > current) dateByEmail.set(email, dateNumber);
}

// First time we see an email we keep it; later repeats of the same email are dropped.
function uniqueEmailsInOrder(emails) {
  const seen = new Set();
  const unique = [];
  for (const email of emails) {
    const key = email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(email.trim());
  }
  return unique;
}

function uniqueTerminationRows(rows) {
  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    const key = row.email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({
      email: row.email.trim(),
      firstName: row.firstName,
      lastName: row.lastName,
    });
  }
  return unique;
}

// Same person on hire and terminate: only the later date's action runs. Unique people are not date-checked.
function keepLaterActionForDuplicatePeople(
  hireEmails,
  terminationRows,
  hireDateByEmail,
  termDateByEmail,
) {
  const keptHire = [];
  const skipTerminate = new Set();

  for (const email of hireEmails) {
    const key = email.toLowerCase();
    if (!termDateByEmail.has(key)) {
      keptHire.push(email);
      continue;
    }

    const hireDate = hireDateByEmail.get(key) || 0;
    const termDate = termDateByEmail.get(key) || 0;

    if (hireDate > termDate) {
      logger.info(`Hire only for ${email}: hire date is later, so terminate is skipped.`);
      keptHire.push(email);
      skipTerminate.add(key);
      continue;
    }

    if (termDate > hireDate) {
      logger.info(`Terminate only for ${email}: terminate date is later, so hire is skipped.`);
      continue;
    }

    logger.info(`No change for ${email}: same person hire and terminate dates are equal or missing.`);
    skipTerminate.add(key);
  }

  const keptTerm = [];
  for (const row of terminationRows) {
    if (!skipTerminate.has(row.email.trim().toLowerCase())) keptTerm.push(row);
  }

  return { hireEmails: keptHire, terminationRows: keptTerm };
}

// ===================== Parse sheet =====================

export function parseHireAndTerminationFromFile(filePath) {
  const fileLabel = basename(filePath);
  const rows = readSpreadsheetRows(filePath);
  if (!rows.length) {
    logger.info(`Empty or unreadable sheet: ${fileLabel}`);
    return { hireEmails: [], terminationRows: [] };
  }

  const header = findHeaderRowInfo(rows);
  if (!header) {
    logger.error(
      `No header row with "Email ID" and "Business Process Name" or "Business Process": ${fileLabel}`,
    );
    return { hireEmails: [], terminationRows: [] };
  }

  const hire = [];
  const hireDateByEmail = new Map();
  const termDateByEmail = new Map();
  const terminationRowsRaw = [];
  let skippedOtherStatusCount = 0;

  for (let i = header.headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const email = normalizeCellText(row[header.emailIdx]);
    if (!email) continue;

    const processLabel = cellText(row, header.procIdx) || "(empty)";
    const kind = classifyBusinessProcessName(processLabel);
    const dateNumber =
      header.dateIdx >= 0 ? dateToNumber(row[header.dateIdx]) : 0;

    if (kind === "hire") {
      hire.push(email);
      keepLaterDate(hireDateByEmail, email, dateNumber);
      continue;
    }

    if (kind === "termination") {
      terminationRowsRaw.push({
        email: cellText(row, header.emailIdx),
        firstName: cellText(row, header.firstIdx),
        lastName: cellText(row, header.lastIdx),
      });
      keepLaterDate(termDateByEmail, email, dateNumber);
      continue;
    }

    skippedOtherStatusCount += 1;
    logger.info(
      `No changes for ${cellText(row, header.emailIdx)}: status "${processLabel}" is not Hire, Change Job, or Termination — skipped.`,
    );
  }

  const picked = keepLaterActionForDuplicatePeople(
    uniqueEmailsInOrder(hire),
    uniqueTerminationRows(terminationRowsRaw),
    hireDateByEmail,
    termDateByEmail,
  );
  const hireEmails = picked.hireEmails;
  const terminationRows = picked.terminationRows;

  logger.info(
    `Parsed ${fileLabel}: ${terminationRows.length} unique termination row(s), ${hireEmails.length} unique hire/Change Job email(s), ${skippedOtherStatusCount} row(s) skipped (not Hire, Change Job, or Termination).`,
  );

  return {
    hireEmails: [...hireEmails],
    terminationRows: [...terminationRows],
  };
}

export function loadTerminationDeactivateRowsFromFile(filePath) {
  const { terminationRows } = parseHireAndTerminationFromFile(filePath);
  return [...terminationRows];
}

export function loadHireEmailsFromFile(filePath) {
  const { hireEmails } = parseHireAndTerminationFromFile(filePath);
  return [...hireEmails];
}
