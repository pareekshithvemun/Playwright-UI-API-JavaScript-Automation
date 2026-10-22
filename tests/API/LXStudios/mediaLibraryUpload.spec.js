// Test Data: testData/LxStudios/MediaLibrary/mediaLibraryTestData.json
// Filter: PROJECT_NAME env var (optional)
//   - Not set → Uploads media for ALL entries in test data
//   - Set → Uploads media for specified project only
// Usage:
//   npm run uploadMediaLibrary
//   PROJECT_NAME="Media Library" npm run uploadMediaLibrary

import {
  test,
  generateToken,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  logger,
  reusableFunctions,
  uploadLibraryToWorkspaceApi,
  uploadFileToSignedUrl,
  scanExternalDocumentApi,
  getDocumentScanAndRagStatusApi,
} from "../../../path.js";

// Load and filter test data by PROJECT_NAME env var
let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/MediaLibrary",
  "mediaLibraryTestData",
  process.env.PROJECT_NAME,
  "ProjectName",
  "MediaLibrary",
);

test.describe.configure({ mode: "parallel" });

testDataArray.forEach((workspaceData) => {
  test.describe(`Upload Media Library - ${workspaceData.ProjectName}`, () => {
    let jwt, workspaceId;

    test.beforeAll(
      "Generate Token and get workspace",
      async ({ request }, testInfo) => {
        testInfo.setTimeout(60000);
        jwt = await generateToken(request);

        let result = await reusableFunctions.getDefaultWorkspaceAndProject({
          listWorkspacesApi,
          getProjectsInWorkspaceApi,
          createProjectApi,
          request,
          jwt,
          projectName: workspaceData.ProjectName,
        });

        workspaceId = result.workspaceId;
        logger.info(`Workspace: ${workspaceId}`);
      },
    );

    test("Upload media files and poll scan status", async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(300000);

      for (const doc of workspaceData.documents) {
        logger.info(`Uploading: ${doc.documentTitle}`);

        let docPayload = {
          documentTitle: doc.documentTitle,
          documentNameWithExtension: doc.documentNameWithExtension,
          description: doc.description ?? "",
          generateTranscript: doc.generateTranscript ?? false,
        };

        let uploadResponse = await uploadLibraryToWorkspaceApi(
          request,
          jwt,
          [docPayload],
          workspaceId,
          null,
        );

        if (!uploadResponse?.data?.uploadMediaLibraryFiles?.length) {
          logger.error(`Failed to get signed URL for ${doc.documentTitle}`);
          continue;
        }

        let { signedUploadUrl, documentId } =
          uploadResponse.data.uploadMediaLibraryFiles[0];

        let filePath = reusableFunctions.getPath(
          "testData/LxStudios/MediaLibrary",
          doc.documentNameWithExtension,
        );

        let uploadStatus = await uploadFileToSignedUrl(
          request,
          signedUploadUrl,
          filePath,
          doc.contentType,
        );

        if (uploadStatus !== 200) {
          logger.error(
            `S3 upload failed for ${doc.documentTitle}. Status: ${uploadStatus}`,
          );
          continue;
        }

        logger.info(`Uploaded to S3: ${doc.documentTitle}`);

        await scanExternalDocumentApi(request, jwt, [documentId]);
        logger.info(`Scan initiated: ${doc.documentTitle}`);

        await pollMediaLibraryUploadStatusApi(
          request,
          jwt,
          documentId,
          doc.documentTitle,
        );
      }
    });
  });
});

// Poll until scanStatus === "UPLOADED" (per getDocumentScanAndRagStatus response:
// { data: { getDocumentScanAndRagStatus: [{ documentId, scanStatus, scanResult, ragStatus, ragError, previewStatus }] } })
async function pollMediaLibraryUploadStatusApi(
  request,
  jwt,
  documentId,
  docTitle,
) {
  let maxAttempts = 30;
  let intervalMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    let response = await getDocumentScanAndRagStatusApi(request, jwt, [
      documentId,
    ]);

    let list = response?.data?.getDocumentScanAndRagStatus;
    if (!list || !list.length) {
      logger.info(
        `${docTitle}: no status yet (${i + 1}/${maxAttempts}), retrying...`,
      );
      await reusableFunctions.setTimer(intervalMs);
      continue;
    }

    let statusItem = list[0];
    let scanStatus = statusItem.scanStatus;

    if (scanStatus === "SAFE") {
      logger.info(`${docTitle}: scanStatus SAFE`);
      return;
    }

    logger.info(
      `${docTitle}: scanStatus=${scanStatus || "unknown"} (${i + 1}/${maxAttempts})`,
    );
    await reusableFunctions.setTimer(intervalMs);
  }
  logger.warn(`${docTitle}: Polling timeout waiting for UPLOADED`);
}
