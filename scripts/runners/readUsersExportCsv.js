import fs from "fs";
import { basename } from "node:path";
import XLSX from "xlsx";
import { logger } from "../../logger.js";

const SKILLSOFT_EMAIL_SUFFIX = "@skillsoft.com";
const DEFAULT_USERS_EXPORT_FILTER_YEAR = 2026;

const MONTH_NUMBER_BY_NAME = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

/** Trim and lowercase — UCM export uses camelCase headers (loginName, firstName, …). */
function normalizeHeaderText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/** Column indexes for Percipio UCM user export CSV (see sample download.csv). */
function findUserExportColumnIndices(headerCells) {
  const row = headerCells.map(normalizeHeaderText);
  const col = (...names) => row.findIndex((h) => names.includes(h));

  return {
    loginIdx: col("loginname"),
    emailIdx: col("email"),
    externalIdIdx: col("externaluserid", "externalid", "external user id"),
    firstIdx: col("firstname"),
    lastIdx: col("lastname"),
    statusIdx: col("status"),
    roleIdx: col("role"),
    dateCreatedIdx: col("date created"),
    jobTitleIdx: col("jobtitle"),
    jobRoleIdx: col("jobrole"),
    directManagerIdx: col("directmanager"),
    headerCells,
  };
}

/** Row 1 is the header in UCM export (no title rows above). */
function findUserExportHeaderRowInfo(rows) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const headerCells = rows[rowIndex].map((cell) => String(cell ?? ""));
    const columns = findUserExportColumnIndices(headerCells);
    if (columns.loginIdx >= 0 && columns.emailIdx >= 0) {
      return { headerRowIndex: rowIndex, ...columns };
    }
  }
  return null;
}

function pickCell(row, columnIndex) {
  return columnIndex >= 0 ? String(row[columnIndex] ?? "").trim() : "";
}

/** XLSX often reads CSV dates as Excel serial numbers (e.g. 46111.22), not YYYY-MM-DD. */
function parseDateCreatedToDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const isoDate = new Date(text);
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }
  if (/^\d+(\.\d+)?$/.test(text)) {
    const parts = XLSX.SSF.parse_date_code(Number(text));
    if (parts) {
      return new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
    }
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatExportDateValue(value) {
  const parsed = parseDateCreatedToDate(value);
  if (!parsed) {
    return String(value ?? "").trim();
  }
  return parsed.toISOString().slice(0, 10);
}

function pickDateCreatedCell(row, columnIndex) {
  if (columnIndex < 0) {
    return "";
  }
  return formatExportDateValue(row[columnIndex]);
}

function rowToFullColumns(row, headerCells) {
  const columns = {};
  for (let i = 0; i < headerCells.length; i++) {
    const key = String(headerCells[i] ?? "").trim();
    if (!key) {
      continue;
    }
    const isDateCreated = normalizeHeaderText(key) === "date created";
    columns[key] = isDateCreated
      ? pickDateCreatedCell(row, i)
      : String(row[i] ?? "").trim();
  }
  return columns;
}

function rowToUser(row, headerInfo) {
  const columns = rowToFullColumns(row, headerInfo.headerCells);
  return {
    loginName: pickCell(row, headerInfo.loginIdx),
    email: pickCell(row, headerInfo.emailIdx),
    externalUserId: pickCell(row, headerInfo.externalIdIdx),
    firstName: pickCell(row, headerInfo.firstIdx),
    lastName: pickCell(row, headerInfo.lastIdx),
    status: pickCell(row, headerInfo.statusIdx).toLowerCase(),
    role: pickCell(row, headerInfo.roleIdx),
    dateCreated: pickDateCreatedCell(row, headerInfo.dateCreatedIdx),
    jobTitle: pickCell(row, headerInfo.jobTitleIdx),
    jobRole: pickCell(row, headerInfo.jobRoleIdx),
    directManager: pickCell(row, headerInfo.directManagerIdx),
    columns,
  };
}

function hasIdentity(user) {
  return Boolean(user.email || user.loginName || user.externalUserId);
}

/** Dedupe by email, else loginName. */
function dedupeUsersPreserveOrder(users) {
  const seen = new Set();
  const uniqueUsers = [];
  for (const user of users) {
    const key = (
      user.email ||
      user.loginName ||
      user.externalUserId
    ).toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueUsers.push(user);
  }
  return uniqueUsers;
}

/**
 * Parse Percipio UCM "download all users" CSV.
 * Browser saves as download.csv; automation saves as <org>-users-export-<jobId>.csv.
 */
export function loadUsersFromExportCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    logger.error(`Users export file not found: ${basename(filePath)}`);
    return [];
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headerInfo = findUserExportHeaderRowInfo(rows);

  if (!headerInfo) {
    logger.error(
      "Users export CSV: expected loginName and email columns in header row",
    );
    return [];
  }

  const users = [];
  for (let i = headerInfo.headerRowIndex + 1; i < rows.length; i++) {
    const user = rowToUser(rows[i], headerInfo);
    if (hasIdentity(user)) {
      users.push(user);
    }
  }

  const uniqueUsers = dedupeUsersPreserveOrder(users);
  logger.info(
    `Parsed ${uniqueUsers.length} users from export (${basename(filePath)})`,
  );
  return uniqueUsers;
}

/** USERS_EXPORT_MONTH is required — 1–12 or jan, february, etc. */
export function resolveUsersExportFilterMonth(monthInput) {
  const raw = String(monthInput ?? process.env.USERS_EXPORT_MONTH ?? "").trim();
  if (!raw) {
    throw new Error(
      "Please pass month — set USERS_EXPORT_MONTH (1-12 or jan-dec) on the command line",
    );
  }

  const lower = raw.toLowerCase();
  if (MONTH_NUMBER_BY_NAME[lower]) {
    return MONTH_NUMBER_BY_NAME[lower];
  }

  const asNumber = Number(lower);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= 12) {
    return asNumber;
  }

  throw new Error(
    `Invalid USERS_EXPORT_MONTH "${raw}" — use 1-12 or jan, feb, mar, …`,
  );
}

/** USERS_EXPORT_YEAR optional — defaults to 2026 when not passed. */
export function resolveUsersExportFilterYear(yearInput) {
  const raw = String(
    yearInput ??
      process.env.USERS_EXPORT_YEAR ??
      DEFAULT_USERS_EXPORT_FILTER_YEAR,
  ).trim();

  if (!raw) {
    return DEFAULT_USERS_EXPORT_FILTER_YEAR;
  }

  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    throw new Error(
      `Invalid USERS_EXPORT_YEAR "${raw}" — use a four-digit year (default ${DEFAULT_USERS_EXPORT_FILTER_YEAR})`,
    );
  }
  return year;
}

function parseDateCreatedSortKey(dateCreated) {
  const parsed = parseDateCreatedToDate(dateCreated);
  if (!parsed) {
    return Number.POSITIVE_INFINITY;
  }
  return parsed.getTime();
}

function getCreatedMonthNumber(dateCreated) {
  const parsed = parseDateCreatedToDate(dateCreated);
  if (!parsed) {
    return null;
  }
  return parsed.getUTCMonth() + 1;
}

function getCreatedYearNumber(dateCreated) {
  const parsed = parseDateCreatedToDate(dateCreated);
  if (!parsed) {
    return null;
  }
  return parsed.getUTCFullYear();
}

/** Filter 1 — column: status */
function hasActiveStatus(user) {
  return user.status === "active";
}

/** Filter 2 — column: role */
function hasLearnerRole(user) {
  const roleLower = String(user.role ?? "")
    .trim()
    .toLowerCase();
  return roleLower === "learner";
}

/** Filter 3 — column: Date Created (year + month from env) */
function wasCreatedInFilterYearAndMonth(user, filterYear, filterMonth) {
  const createdYear = getCreatedYearNumber(user.dateCreated);
  const createdMonth = getCreatedMonthNumber(user.dateCreated);
  return (
    createdYear === filterYear &&
    createdMonth !== null &&
    createdMonth === filterMonth
  );
}

/** Filter 4 — column: email (exclude @skillsoft.com; blank email is kept) */
function hasNonSkillsoftEmail(user) {
  const emailLower = String(user.email ?? "")
    .trim()
    .toLowerCase();
  if (!emailLower) {
    return true;
  }
  return !emailLower.endsWith(SKILLSOFT_EMAIL_SUFFIX);
}

/** True only when all four export filters pass for this row. */
function userMatchesExportFilters(user, filterYear, filterMonth) {
  if (!hasActiveStatus(user)) {
    return false;
  }
  if (!hasLearnerRole(user)) {
    return false;
  }
  if (!wasCreatedInFilterYearAndMonth(user, filterYear, filterMonth)) {
    return false;
  }
  if (!hasNonSkillsoftEmail(user)) {
    return false;
  }
  return true;
}

/**
 * Apply all export filters: active, Learner, Date Created year+month, non-skillsoft email.
 * Required: USERS_EXPORT_MONTH. Optional: USERS_EXPORT_YEAR (default 2026).
 */
export function applyUsersExportFilters(users, options = {}) {
  const filterMonth = resolveUsersExportFilterMonth(options.month);
  const filterYear = resolveUsersExportFilterYear(options.year);

  const filtered = users.filter((user) =>
    userMatchesExportFilters(user, filterYear, filterMonth),
  );

  logger.info(
    `Export filters applied (active, Learner, ${filterYear}-${String(filterMonth).padStart(2, "0")}, not ending @skillsoft.com or blank email): ${filtered.length} of ${users.length}`,
  );
  return filtered;
}

/** Ascending by Date Created (empty dates last). */
export function sortUsersFromExportByDateCreatedAsc(users) {
  return [...users].sort(
    (a, b) =>
      parseDateCreatedSortKey(a.dateCreated) -
      parseDateCreatedSortKey(b.dateCreated),
  );
}

/** Log every CSV column for each filtered user (uses logger, not console). */
export function logFilteredUsersFromExport(users) {
  logger.info(`Filtered users to log: ${users.length}`);
  users.forEach((user, index) => {
    logger.info(`[${index + 1}] ${JSON.stringify(user.columns)}`);
  });
}

/** Apply filters, sort by Date Created ascending, log all columns, return users. */
export function getFilteredSortedUsersFromExport(users, options = {}) {
  const filtered = applyUsersExportFilters(users, options);
  const sorted = sortUsersFromExportByDateCreatedAsc(filtered);
  // logFilteredUsersFromExport(sorted);
  return sorted;
}
