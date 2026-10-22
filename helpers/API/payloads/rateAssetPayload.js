export function rateAssetBody(assetId,rating) {
    return [
        {
            "operationName": "upsertAssetRating",
            "variables": {
                "assetId": assetId,
                "userRating": rating
            },
            "query": "mutation upsertAssetRating($assetId: ID!, $userRating: Int!) {\n  upsertAssetRating(assetId: $assetId, userRating: $userRating) {\n    userRating\n    avgRating\n    totalUserCount\n    oneStarUserCount\n    twoStarUserCount\n    threeStarUserCount\n    fourStarUserCount\n    fiveStarUserCount\n    __typename\n  }\n}\n"
        }
    ]

  }
  