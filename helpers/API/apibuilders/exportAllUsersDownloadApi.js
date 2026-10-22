import {
  headerData,
  urlData,
  expect,
  logger,
  path,
  fs,
  reusableFunctions,
} from "../../../path.js";

const DEFAULT_POLL_INTERVAL_MS = 2500;
const DEFAULT_STATUS_POLL_MAX_RETRIES = 10;

/** Start async export job; returns job id from plain-text response body. */
export async function startUsersExportDownloadJob(request, jwt) {
  const response = await request.post(urlData.usersDownloadAllUsersUrl, {
    headers: headerData.getAllUsersHeaders(jwt, "application/json"),
  });
  expect(response.status()).toBe(200);
  const jobId = (await response.text()).replace(/"/g, "").trim();
  if (!jobId) {
    throw new Error("Users export start returned empty job id");
  }
  logger.info(`Users export job started: ${jobId}`);
  return jobId;
}

/** Poll status until download_url is present or max retries reached. */
export async function waitForUsersExportDownloadUrl(request, jwt, jobId) {
  const maxRetries = getUsersExportStatusPollMaxRetries();
  const pollIntervalMs = getUsersExportPollIntervalMs();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await request.get(urlData.usersDownloadStatusUrl(jobId), {
      headers: headerData.getAllUsersHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    if (body?.download_url) {
      logger.info(
        `Users export ready for job ${jobId} (attempt ${attempt}/${maxRetries})`,
      );
      return body.download_url;
    }
    if (attempt < maxRetries) {
      await reusableFunctions.setTimer(pollIntervalMs);
    }
  }

  throw new Error(
    `Users export not ready after ${maxRetries} status polls (job ${jobId})`,
  );
}

/** Fetch presigned S3 URL and write CSV under saveDir (creates dir if missing). */
export async function saveUsersExportCsvFromUrl(
  request,
  downloadUrl,
  saveDir,
  orgLabel,
  jobId,
) {
  // S3/browser name is download.csv — we rename so each run is unique under test-results/downloads.
  fs.mkdirSync(saveDir, { recursive: true });
  const fileResponse = await request.get(downloadUrl);
  expect(fileResponse.status()).toBe(200);

  const safeOrg = String(orgLabel || "org").replace(/[^\w.-]+/g, "_");
  const savePath = path.join(saveDir, `${safeOrg}-users-export-${jobId}.csv`);
  fs.writeFileSync(savePath, await fileResponse.body());
  logger.info(`Users export saved: ${savePath}`);
  return savePath;
}

/** Start job, poll status, download CSV to saveDir (local or Jenkins workspace). */
export async function exportAllUsersCsvToFile(request, jwt, saveDir, orgLabel) {
  const jobId = await startUsersExportDownloadJob(request, jwt);
  const downloadUrl = await waitForUsersExportDownloadUrl(request, jwt, jobId);
  const savePath = await saveUsersExportCsvFromUrl(
    request,
    downloadUrl,
    saveDir,
    orgLabel,
    jobId,
  );
  return { jobId, downloadUrl, savePath };
}

/** Milliseconds between status polls (env USERS_EXPORT_POLL_MS or default 2s). */
function getUsersExportPollIntervalMs() {
  const raw = Number(process.env.USERS_EXPORT_POLL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_POLL_INTERVAL_MS;
}

/** Max status polls before failing (env USERS_EXPORT_MAX_RETRIES or default 10). */
function getUsersExportStatusPollMaxRetries() {
  const raw = Number(process.env.USERS_EXPORT_MAX_RETRIES);
  return Number.isFinite(raw) && raw > 0
    ? raw
    : DEFAULT_STATUS_POLL_MAX_RETRIES;
}
