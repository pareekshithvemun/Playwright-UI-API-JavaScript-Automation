import {
  test,
  generateToken,
  logger,
  reusableFunctions,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  listContentContainersApi,
  listMediaDocumentsApi,
  updateContentMetadataApi,
  listKnowledgeSourceDocumentsApi,
  shareDocumentsToContainerApi,
  publishCourseAiContentGenApi,
  urlData,
} from "../../../path.js";

// Run AFTER dev runs DB script (dummy courses exist).
// 1) Updates course thumbnail (image) via content-metadata API.
// 2) Shares knowledge source documents to course container via shareDocumentsToContainer (same as assessment/conversation).
// 3) Publishes the course via ai-content-gen publish API.
// Test data: testData/LxStudios/CourseCreation/lxCourseCreationTestData.json
// Requires: title, projectName, imageTitle, knowledgeSource (document titles), locale.
//
// Org scope (siteType): reusableFunctions.getOrgEntriesForSiteType (see helpers/UI/commonFunctions.js).
//   Includes TriggerInConfigOrg for single org from config; EU/US/parent/child maps same as lxCourseCreationWorkflow.spec.js.
//
// Commands:
//   npm run updateCourseThumbnailAndKnowledgeSource                  → all sites (from url map)
//   siteType=TriggerInConfigOrg npm run updateCourseThumbnailAndKnowledgeSource → config org only
//   courseCreationTestName='Course Title' npm run updateCourseThumbnailAndKnowledgeSource → filter by title
let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/CourseCreation",
  "lxCourseCreationTestData",
  process.env.courseCreationTestName,
  "title",
  "CourseCreation",
);

testDataArray.forEach((data) => {
  test.describe(`LX Course Thumbnail and Knowledge Source Update - ${data.title}`, () => {
    test("Update thumbnail and knowledge source across orgs (run after DB script)", async ({
      request,
    }) => {
      test.setTimeout(300000);

      const siteType = process.env.siteType || "TriggerInAllSites";

      const orgsData = reusableFunctions.readDatafromJsonFilenotasync(
        "testData/orgsData/allOrgs.json",
      );
      const filteredOrgs = reusableFunctions.getOrgEntriesForSiteType(
        orgsData,
        siteType,
      );

      logger.info(
        `Orgs to process: ${filteredOrgs.length} (siteType: ${siteType})`,
      );

      let successCount = 0;
      let failCount = 0;
      let skipCount = 0;

      for (const [baseURL, orgId] of filteredOrgs) {
        const orgName = baseURL
          .replace("https://", "")
          .replace(".percipio.com", "");

        try {
          logger.info(`\n========== Processing: ${orgName} ==========`);

          urlData.devtokenGeneratorapiUrl = `${baseURL}/api/public/auth/authenticate`;
          urlData.getUsersUrl = `${baseURL}/api/ucm/users`;
          urlData.lxStudioGraphQLUrl = `${baseURL}/lx-studio/api/lx-studio-service/graphql`;
          urlData.getAiContentGenContentMetadataUrl = (
            contentId,
            lang = "en-US",
          ) =>
            `${baseURL}/ai-content-gen/api/content-metadata/${contentId}?lang=${lang}`;
          urlData.getAiContentGenPublishUrl = (contentId) =>
            `${baseURL}/ai-content-gen/api/publish/${contentId}`;
          urlData.Org_ID = orgId;

          const jwt = await generateToken(request);

          const wsResult =
            await reusableFunctions.getDefaultWorkspaceAndProject({
              listWorkspacesApi,
              getProjectsInWorkspaceApi,
              createProjectApi,
              request,
              jwt,
              projectName: data.projectName,
            });

          const { workspaceId, projectId } = wsResult;

          const listResp = await listContentContainersApi(
            request,
            jwt,
            workspaceId,
            1,
            100,
            null,
            false,
            projectId,
          );
          const items = listResp.data.listContentContainers.items;
          const container = items.find(
            (c) =>
              c.name.trim().toLowerCase() === data.title.trim().toLowerCase(),
          );
          if (!container) {
            logger.info(
              `No container named "${data.title}" in ${orgName}, skipping`,
            );
            skipCount++;
            continue;
          }
          const containerId = container.id;

          const mediaResp = await listMediaDocumentsApi(
            request,
            jwt,
            containerId,
          );
          const documents =
            mediaResp.data.listMediaDocuments.mediaDocuments || [];
          const totalCount =
            mediaResp.data.listMediaDocuments.totalCount ?? documents.length;

          let thumbnailStatus = "skipped";
          if (totalCount > 0 && documents.length > 0) {
            const imageDoc = documents.find(
              (d) =>
                (d.title || "").trim().toLowerCase() ===
                (data.imageTitle || "").trim().toLowerCase(),
            );
            if (imageDoc) {
              await updateContentMetadataApi(
                request,
                jwt,
                containerId,
                {
                  title: data.title,
                  description: data.description ?? "",
                  skills: "",
                  cpExpertiseLevel: "Beginner",
                  duration: "10",
                  image: imageDoc.id,
                  imageAltText: imageDoc.description || "",
                  contentSource: "Custom",
                  preRequisites: data.preRequisites ?? "",
                },
                data.locale || "en-US",
              );
              thumbnailStatus = "updated";
              logger.info(`Updating thumbnail for ${orgName}: done`);
            } else {
              logger.info(
                `Skipping thumbnail for ${orgName}: no image titled "${data.imageTitle}" (${documents.length} image(s) in container)`,
              );
              skipCount++;
            }
          } else {
            logger.info(
              `Skipping thumbnail for ${orgName}: no images in container (response size: ${documents.length})`,
            );
            skipCount++;
          }

          let knowledgeSourceStatus = "skipped";
          if (!data.knowledgeSource || data.knowledgeSource.length === 0) {
            logger.info(
              `Skipping knowledge source for ${orgName}: empty in test data`,
            );
          } else {
            const existingDocsResp = await listKnowledgeSourceDocumentsApi(
              request,
              jwt,
              workspaceId,
              1,
              100,
            );
            const existingDocs =
              existingDocsResp?.data?.listKnowledgeSourceDocuments
                ?.knowledgeSourceDocuments || [];
            const documentIds = [];
            for (const docName of data.knowledgeSource) {
              const found = existingDocs.find(
                (d) => d.title?.toLowerCase() === docName.toLowerCase(),
              );
              if (found) {
                documentIds.push(found.id);
                logger.info(`Found knowledge source: ${docName} (${found.id})`);
              } else {
                logger.warn(`Knowledge source not found: ${docName}`);
              }
            }
            if (documentIds.length > 0) {
              logger.info(
                `Updating knowledge source for ${orgName}: sharing ${documentIds.length} document(s)`,
              );
              await shareDocumentsToContainerApi(
                request,
                jwt,
                documentIds,
                containerId,
              );
              knowledgeSourceStatus = "updated";
              logger.info(
                `Updating knowledge source for ${orgName}: done (shared ${documentIds.length} document(s))`,
              );
            } else {
              logger.info(
                `Skipping knowledge source for ${orgName}: no matching documents found in workspace`,
              );
            }
          }

          await publishCourseAiContentGenApi(request, jwt, containerId);
          logger.info(`Course published for ${orgName}: ${containerId}`);

          successCount++;
          logger.info(
            `Done ${orgName}: thumbnail=${thumbnailStatus}, knowledgeSource=${knowledgeSourceStatus}, published=yes`,
          );
        } catch (error) {
          logger.error(`Failed for ${orgName}: ${error.message}`);
          failCount++;
        }
      }

      logger.info("\n========== SUMMARY ==========");
      logger.info(
        `Successful: ${successCount}, Failed: ${failCount}, Skipped: ${skipCount}`,
      );
    });
  });
});
