export function createCategoryPayload(categoryName, ownerId) {
  return {
    operationName: "createCategory",
    variables: {
      categoryName: categoryName,
      ownerId: ownerId,
    },
    query: `mutation createCategory($categoryName: String, $ownerId: ID) {
  createCategory(categoryName: $categoryName, ownerId: $ownerId) {
    id
    name
    __typename
  }
}`,
  };
}
