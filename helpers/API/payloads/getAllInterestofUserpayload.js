export function getAllInterestsOfUserPayload() {
  return [
    {
      operationName: "gatewayInterests",
      variables: {},
      query: "query gatewayInterests {\n  interests\n}\n",
    },
    {
      operationName: "areaQuery",
      variables: {
        locale: "en-US",
      },
      query:
        "query areaQuery($locale: String!) {\n  areas(locale: $locale) {\n    id: uuid\n    title\n    type\n    imageUrl\n    imageAltText\n    slug\n    subjects {\n      areaId\n      id: uuid\n      imageUrl\n      imageAltText\n      slug\n      title\n      includedInInterests\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
