export function createPlayListBody(playlistName) {
  return [
    {
      operationName: "createPlaylist",
      variables: {
        input: {
          name: playlistName,
          description: "Important",
        },
      },
      query:
        "mutation createPlaylist($input: CreatePlaylistInput!) {createPlaylist(input: $input) {id  name   description __typename}}",
    },
  ];
}
