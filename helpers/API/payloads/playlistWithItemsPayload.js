export function playlistWithItemsPayload(playlistId) {
  return [
    {
      operationName: "playlistWithItems",
      variables: {
        input: {
          id: playlistId,
          offset: 0,
          limit: 20,
          order: "ASC",
        },
      },
      query:
        "query playlistWithItems($input: playlistWithItemsInput) {\n  playlistWithItems(input: $input) {\n    id\n    name\n    description\n    itemsCount\n    behaviours {\n      shareable\n      deletable\n      __typename\n    }\n    authorized\n    playlistItems {\n      playlistId\n      id\n      itemId: assetId\n      itemType: assetType\n      cachedLanguageCode: locale\n      order\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
