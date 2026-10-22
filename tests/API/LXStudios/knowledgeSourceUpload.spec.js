// Test Data: testData/LxStudios/KnowledgeSource/knowledgeSourceTestData.json
// Filter: PROJECT_NAME env var (optional)
//   - Not set → Uploads documents for ALL projects
//   - Set → Uploads documents for specified project only
// Usage:
//   npm run uploadKnowledgeSource                                    (upload documents to all projects in test data)
//   PROJECT_NAME="Akara Digital Customer Experience Launch" npm run uploadKnowledgeSource

import {
  test,
  generateToken,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  logger,
  reusableFunctions,
  uploadExternalDocumentsApi,
  uploadFileToSignedUrl,
  scanExternalDocumentApi,
  getDocumentScanAndRagStatusApi,
  listKnowledgeSourceDocumentsApi,
} from "../../../path.js";

// Load and filter test data by PROJECT_NAME env var
let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/KnowledgeSource",
  "knowledgeSourceTestData",
  process.env.PROJECT_NAME,
  "ProjectName",
  "KnowledgeSource",
);

test.describe.configure({ mode: "parallel" });

(testDataArray || []).forEach((projectData) => {
  test.describe(`Upload Knowledge Source - ${projectData.ProjectName}`, () => {
    let jwt, workspaceId, projectId;
    let existingDocs = [];

    test.beforeAll(
      "Generate Token and get workspace/project",
      async ({ request }, testInfo) => {
        testInfo.setTimeout(60000);
        jwt = await generateToken(request);

        let result = await reusableFunctions.getDefaultWorkspaceAndProject({
          listWorkspacesApi,
          getProjectsInWorkspaceApi,
          createProjectApi,
          request,
          jwt,
          projectName: projectData.ProjectName,
        });

        workspaceId = result.workspaceId;
        projectId = result.projectId;
        logger.info(`Workspace: ${workspaceId}, Project: ${projectId}`);

        // Get existing documents in workspace
        let existingDocsResponse = await listKnowledgeSourceDocumentsApi(
          request,
          jwt,
          workspaceId,
        );
        existingDocs =
          existingDocsResponse?.data?.listKnowledgeSourceDocuments
            ?.knowledgeSourceDocuments || [];
        logger.info(
          `Found ${existingDocs.length} existing document(s) in workspace`,
        );
      },
    );

    test("Upload documents and poll scan status", async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(300000); // 5 minutes

      for (const doc of projectData.documents) {
        // Check if document already exists
        let existing = existingDocs.find(
          (d) => d.title?.toLowerCase() === doc.documentTitle.toLowerCase(),
        );

        if (existing) {
          logger.info(
            `SKIP: "${doc.documentTitle}" already exists (ID: ${existing.id})`,
          );
          continue;
        }

        logger.info(`Uploading: ${doc.documentTitle}`);

        // Get signed URL
        let uploadResponse = await uploadExternalDocumentsApi(
          request,
          jwt,
          [doc],
          workspaceId,
          projectId,
          null,
        );

        if (!uploadResponse?.data?.uploadExternalDocuments?.length) {
          logger.error(`Failed to get signed URL for ${doc.documentTitle}`);
          continue;
        }

        let { signedUploadUrl, documentId } =
          uploadResponse.data.uploadExternalDocuments[0];

        // Upload file to S3
        let filePath = reusableFunctions.getPath(
          "testData/LxStudios/KnowledgeSource",
          doc.documentNameWithExtension,
        );

        let uploadStatus = await uploadFileToSignedUrl(
          request,
          signedUploadUrl,
          filePath,
        );

        if (uploadStatus !== 200) {
          logger.error(
            `S3 upload failed for ${doc.documentTitle}. Status: ${uploadStatus}`,
          );
          continue;
        }

        logger.info(`Uploaded to S3: ${doc.documentTitle}`);

        // Scan document
        await scanExternalDocumentApi(request, jwt, [documentId]);
        logger.info(`Scan initiated: ${doc.documentTitle}`);

        // Poll scan status
        await pollScanStatus(request, jwt, documentId, doc.documentTitle);
      }
    });
  });
});

async function pollScanStatus(request, jwt, documentId, docTitle) {
  for (let i = 0; i < 20; i++) {
    let response = await getDocumentScanAndRagStatusApi(request, jwt, [
      documentId,
    ]);
    let doc = response?.data?.getDocumentScanAndRagStatus?.[0];

    if (doc?.scanStatus === "SAFE" && doc?.ragStatus === "COMPLETED") {
      logger.info(`${docTitle}: SAFE & COMPLETED`);
      return;
    }

    logger.info(
      `${docTitle}: ${doc?.scanStatus} | ${doc?.ragStatus} (${i + 1}/20)`,
    );
    await reusableFunctions.setTimer(5000);
  }
  logger.warn(`${docTitle}: Polling timeout`);
}
