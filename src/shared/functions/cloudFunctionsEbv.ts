type env = "LIVE" | "STAGING" | "DEVELOPMENT" | "TESTING";

export function cloudMonthEndRunEndPoint(enviroment: env) {
  if (enviroment === "LIVE") {
    return "https://us-central1-ijgmms.cloudfunctions.net/monthEndRun";
  } else if (enviroment === "STAGING") {
    return "https://us-central1-ijgmms-development.cloudfunctions.net/monthEndRun";
  } else if (enviroment === "DEVELOPMENT") {
    return "";
  } else if (enviroment === "TESTING") {
    return "https://us-central1-ijgmms-testing.cloudfunctions.net/monthEndRun";
  }
}
