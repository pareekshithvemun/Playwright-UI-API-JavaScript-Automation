import {
  test,
  generateTokenLearner,
  reusableFunctions,
  createplaylistbuilder,
  getallplayLists,
  dataOfplayList,
  addcontentBuilder,
  playlistWithItemsApi,
  logger,
} from "../../../path.js";

test.describe.parallel("Create playlist", () => {
  const { primary: playlistBasename, secondary: userBasename } =
    reusableFunctions.splitFileNameEnv(
      process.env.FileName || "playListDataOne,presales1bUsers",
    );
  if (!playlistBasename || !userBasename) {
    throw new Error(
      "Set FileName=playlistBasename,userBasename (e.g. playListDataOne,presales1bUsers)",
    );
  }
  const pathofuserData = reusableFunctions.getPath(
    "testData/usersData",
    `${userBasename}.json`,
  );
  const userDataFromJson =
    reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
  const finalData = userDataFromJson.users;

  finalData.forEach((data) => {
    test(`Create playlist and add content for user: ${data}`, async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(100000);
      let userToken = await generateTokenLearner(
        request,
        data,
        "Welcome1"
      );
      if (userToken) {
        await createPlayList(request, userToken, data, playlistBasename);
      } else {
        logger.info(
          `Failed to create playlist for user ${data} due to token issue`
        );
      }
    });
  });
});

// ===================== Helper Functions =====================
// Re-runs must not create a second playlist with the same name for the same user.
async function findPlaylistIdByName(request, jwt, playlistName) {
  await getallplayLists(request, jwt, [{ playListName: playlistName }]);
  const existingIds = dataOfplayList.getCurrentSessionplayListIds() || [];
  if (existingIds.length === 0) return null;
  return existingIds[0];
}

// playlistWithItems is the source of truth for assets already on the playlist.
function existingPlaylistItemIds(playlistWithItems) {
  const itemIds = new Set();
  for (const item of playlistWithItems?.playlistItems || []) {
    itemIds.add(item.itemId);
  }
  return itemIds;
}

// Add only assets that are not already on the playlist.
async function addMissingPlaylistContent(
  request,
  jwt,
  playlistId,
  playlist,
  user,
) {
  const playlistWithItems = await playlistWithItemsApi(
    request,
    jwt,
    playlistId,
  );
  if (!playlistWithItems) {
    logger.error(
      `Could not read items for playlist ${playlist.playListName} for user ${user}`,
    );
    return;
  }

  const existingItemIds = existingPlaylistItemIds(playlistWithItems);
  if (existingItemIds.size === 0) {
    logger.info(
      `Playlist ${playlist.playListName} has no content for user ${user} adding content`,
    );
  }

  let addedAny = false;
  for (const content of playlist.playListContent) {
    if (existingItemIds.has(content.contentItemUuid)) continue;
    await addcontentBuilder(
      request,
      jwt,
      playlistId,
      content.contentItemUuid,
      content.contentItemTypeName,
    );
    addedAny = true;
  }

  if (!addedAny) {
    logger.info(
      `Playlist ${playlist.playListName} already has content for user ${user} skipping content add`,
    );
  }
}

async function createPlayList(request, jwt, user, playlistBasename) {
  let playListFilepath = reusableFunctions.getPath(
    "testData/PlayListData",
    `${playlistBasename}.json`,
  );
  try {
    let data = reusableFunctions.readDatafromJsonFilenotasync(playListFilepath);
    let playListData = data.PLAYLISTDATA;

    for (const playlist of playListData) {
      let playlistId = await findPlaylistIdByName(
        request,
        jwt,
        playlist.playListName,
      );
      if (playlistId) {
        logger.info(
          `Playlist ${playlist.playListName} already exists for user ${user} skipping create`,
        );
      } else {
        await createplaylistbuilder(
          request,
          jwt,
          playlist.playListName,
          user,
        );
        playlistId = await findPlaylistIdByName(
          request,
          jwt,
          playlist.playListName,
        );
      }

      if (!playlistId) {
        logger.error(
          `Playlist ${playlist.playListName} was not found for user ${user}`,
        );
        continue;
      }

      await addMissingPlaylistContent(
        request,
        jwt,
        playlistId,
        playlist,
        user,
      );
    }
  } catch (e) {
    logger.error(`playcreation failed due to error ${e}`);
  }
}
