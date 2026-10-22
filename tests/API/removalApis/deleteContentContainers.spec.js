import {
  test,
  generateToken,
  listWorkspacesApi,
  listContentContainersApi,
  deleteContentContainersApi,
  logger,
} from "../../../path.js";

let jwt;
let workspaceId;
let workspaceName = process.env.WorkspaceName || "Kowshik";

test.beforeAll(
  "Generate Token and Get Workspace",
  async ({ request }, testInfo) => {
    testInfo.setTimeout(40000);
    jwt = await generateToken(request);
    logger.info(`JWT Token generated successfully for container cleanup`);
    logger.info(`Target Workspace: ${workspaceName}`);

    // Get workspace ID
    const workspacesResponse = await listWorkspacesApi(request, jwt);
    const workspace = workspacesResponse.data.listWorkspaces.find(
      (ws) => ws.name === workspaceName
    );

    if (!workspace) {
      throw new Error(`Workspace '${workspaceName}' not found`);
    }
    workspaceId = workspace.id;
    logger.info(`Found workspace ID: ${workspaceId}`);
  }
);

test.describe("Delete Content Containers", () => {
  test("Delete all caisyForYou containers from workspace", async ({
    request,
  }) => {
    await deleteAllContainersForWorkspace(
      request,
      jwt,
      workspaceId,
      "caisyForYou"
    );
  });

  test("Delete all presentationPractice containers from workspace", async ({
    request,
  }) => {
    await deleteAllContainersForWorkspace(
      request,
      jwt,
      workspaceId,
      "presentationPractice"
    );
  });

  test("Delete all assessments containers from workspace", async ({
    request,
  }) => {
    await deleteAllContainersForWorkspace(
      request,
      jwt,
      workspaceId,
      "assessments"
    );
  });
});

// Helper function to delete all containers for a workspace
async function deleteAllContainersForWorkspace(
  request,
  jwt,
  workspaceId,
  moduleType
) {
  try {
    logger.info(
      `Fetching all ${moduleType} containers for workspace ${workspaceId}`
    );

    const listResponse = await listContentContainersApi(
      request,
      jwt,
      workspaceId,
      1,
      100,
      moduleType,
      false
    );

    const containers = listResponse.data.listContentContainers.items;

    if (containers && containers.length > 0) {
      logger.info(
        `Found ${containers.length} ${moduleType} containers. Deleting...`
      );

      for (const container of containers) {
        await deleteContentContainersApi(
          request,
          jwt,
          container.id,
          workspaceId
        );
        logger.info(`Deleted container: ${container.name} (${container.id})`);
      }

      logger.info(
        `Successfully deleted ${containers.length} ${moduleType} containers`
      );
    } else {
      logger.info(`No ${moduleType} containers found to delete`);
    }
  } catch (error) {
    logger.error(`Error deleting ${moduleType} containers: ${error.message}`);
    throw error;
  }
}
