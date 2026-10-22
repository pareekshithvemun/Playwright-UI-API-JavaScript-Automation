import reusableFunctions from "../../UI/commonFunctions";
import { logger } from "../../../logger.js";

export function activityDashboardPayload(preset) {
  let bothDates = reusableFunctions.getActivityDashboardDateRange(preset);
  let startDate = bothDates.startDate;
  let endDate = bothDates.endDate;
  logger.info(`Activity dashboard preset:${preset}`);
  logger.info(`startDate for activtyDashBoard:${startDate}`);
  logger.info(`EndDate for activtyDashBoard:${endDate}`);
  return [
    {
      operationName: "getActivityDashboard",
      variables: {
        start: startDate,
        end: endDate,
        preset: preset,
        displayLocale: "en-US",
      },
      query:
        "query getActivityDashboard($start: String!, $end: String!, $displayLocale: String!, $audience: [ID]) {\n  activityDashboard(\n    start: $start\n    end: $end\n    displayLocale: $displayLocale\n    audience: $audience\n  ) {\n    data {\n      assetType\n      uniqueTitles\n      countViews\n      countLearners\n      totalAchievements\n      sumHours\n      __typename\n    }\n    __typename\n  }\n}\n",
    },
  ];
}
