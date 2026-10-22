export function deletePlayListBody(playListId) {
  return [
    {
      operationName: "deletePlaylist",
      variables: { id: playListId},
      query:
        "mutation deletePlaylist($id: ID!) {\n  deletePlaylist(id: $id)\n}\n",
    },
  ];
}
