export function getplaylistsbody() {
  return [
    {
      operationName: "userPlaylistsWithLimitedItems",
      variables: {},
      query:
        "query userPlaylistsWithLimitedItems($limit: Int) {\n  userPlaylistsWithLimitedItems(itemsLimit: $limit) {\n    count\n    rows {\n      id\n      name\n      description\n      behaviours {\n        shareable\n        deletable\n        __typename\n      }\n      itemsCount\n      playlistItems {\n        assetId\n        assetType\n        locale\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
    {
      operationName: "sharedPlaylistsWithLimitedItems",
      variables: {},
      query:
        "query sharedPlaylistsWithLimitedItems($limit: Int) {\n  sharedPlaylistsWithLimitedItems(limit: $limit) {\n    count\n    rows {\n      id\n      name\n      description\n      behaviours {\n        shareable\n        deletable\n        __typename\n      }\n      itemsCount\n      isPlaylistShared\n      playlistItems {\n        assetId\n        assetType\n        locale\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
