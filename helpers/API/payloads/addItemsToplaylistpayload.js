export function addItemToPlayListBody(playlistID, contentID, contentType) {
  return [
    {
      operationName: "addOrDeleteItemFromPlaylists",
      variables: {
        input: {
          addItems: {
            playlistIdsAndOrders: [
              {
                playlistId: playlistID,
                order: 1,
              },
            ],
            assetId: contentID,
            assetType: contentType,
            locale: "en-US",
            context: {
              fromWithInView: "UNKNOWN",
              source: "WEB",
            },
          },
          deleteItems: [],
        },
      },
      query:
        "mutation addOrDeleteItemFromPlaylists($input: AddOrDeletePlaylistItemInput) {\n  addOrDeleteItemFromPlaylists(input: $input) {\n    addItemtoPlaylists {\n      id\n      playlistId\n      __typename\n    }\n    deleteItemFromPlaylists {\n      id\n      isRemoved\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
