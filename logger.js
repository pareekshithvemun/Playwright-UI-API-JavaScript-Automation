import {
  config,
  fs,
  path,
  createLogger,
  transports,
  format,
} from "./path.js";

const baseURL = config.get("Environment").baseURL; // shown once at startup so you know which org the run targets
const logDirectory = path.join(path.resolve(__dirname), "Logs"); // all runs write under repo/Logs/
const logPathMarkerFile = path.join(logDirectory, ".playwright-current-log"); // shares one log path between Playwright loader and workers
const SPLAT = Symbol.for("splat"); // winston passes extra logger.info("msg", obj) args here

function ensureLogDirectory() {
  // avoids crash on first run when Logs/ does not exist yet
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
}

function buildLogFilePath(now = new Date()) {
  const options = { timeZone: "Asia/Kolkata", hour12: false }; // team timezone for log filenames
  const istTime = now.toLocaleString("en-US", options);
  const [date, time] = istTime.split(",");
  const [month, day, year] = date.trim().split("/");
  const [hours, minutes, seconds] = time.trim().split(":");

  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const formattedTime = `${hours.padStart(2, "0")}-${minutes.padStart(2, "0")}-${seconds.padStart(2, "0")}`;

  return path.join(logDirectory, `playwright_${formattedDate} ${formattedTime}.log`); // one timestamped file name per run
}

function isPlaywrightRun() {
  return process.argv.some((arg) => arg.includes("playwright")); // separates Playwright from standalone node scripts
}

function isPlaywrightLoader() {
  return isPlaywrightRun() && process.env.TEST_WORKER_INDEX === undefined; // CLI process that discovers tests before workers start
}

function isPlaywrightWorker() {
  return process.env.TEST_WORKER_INDEX !== undefined; // forked process that actually runs the test
}

function resolveLogFilePath() {
  if (process.env.PW_LOG_FILE) {
    return process.env.PW_LOG_FILE; // same process imported logger twice — reuse path
  }

  ensureLogDirectory();

  if (isPlaywrightWorker() && fs.existsSync(logPathMarkerFile)) {
    const sharedPath = fs.readFileSync(logPathMarkerFile, "utf8").trim();
    if (sharedPath) {
      process.env.PW_LOG_FILE = sharedPath;
      return sharedPath; // worker appends to the file the loader already chose
    }
  }

  const logFilePath = buildLogFilePath();

  if (isPlaywrightLoader()) {
    fs.writeFileSync(logPathMarkerFile, logFilePath, "utf8"); // loader tells workers which file to use
  }

  process.env.PW_LOG_FILE = logFilePath;
  return logFilePath;
}

function formatMessage(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    return value.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, ""); // strip color codes from Playwright/Jest output
  }
  if (typeof value !== "object") return String(value);

  if (value instanceof Error) {
    return value.message || String(value); // avoid logging full stack for every catch
  }

  if (value.loginName || value.email) {
    const parts = [];
    if (value.loginName) parts.push(`loginName=${value.loginName}`);
    if (value.email) parts.push(`email=${value.email}`);
    if (value.id) parts.push(`id=${value.id}`);
    return parts.join(" | "); // user objects logged as readable one-liners
  }

  if (value.name || value.id || value.message) {
    const parts = [];
    if (value.name) parts.push(`name=${value.name}`);
    if (value.id) parts.push(`id=${value.id}`);
    if (value.message) parts.push(`message=${value.message}`);
    return parts.join(", "); // API response objects logged as readable one-liners
  }

  try {
    const text = JSON.stringify(value);
    return text.length > 400 ? `${text.slice(0, 400)}…` : text; // cap huge accidental object dumps
  } catch {
    return String(value);
  }
}

function formatLogLine(info) {
  const parts = [formatMessage(info.message)];
  const extra = info[SPLAT];
  if (Array.isArray(extra) && extra.length) {
    parts.push(...extra.map(formatMessage)); // joins logger.info("label", obj) into one readable line
  }
  return parts.filter(Boolean).join(" ");
}

ensureLogDirectory();
const logFilePath = resolveLogFilePath();

if (isPlaywrightLoader() || !isPlaywrightRun()) {
  console.log(`Running script on ${baseURL}`); // print org once; workers skip to avoid duplicate lines
}

const loggerTransports = [new transports.Console()]; // always mirror logs to terminal
if (isPlaywrightWorker() || !isPlaywrightRun()) {
  loggerTransports.push(new transports.File({ filename: logFilePath })); // only worker/standalone write file — loader used to create empty orphan logs
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.splat(), // required so extra args in logger.info() are captured
    format.printf((info) => {
      return `${info.timestamp} [${info.level.toUpperCase()}]: ${formatLogLine(info)}`;
    }),
  ),
  transports: loggerTransports,
});

export { logger };
