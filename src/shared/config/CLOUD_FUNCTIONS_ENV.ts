export const MONTH_END_RUN_ENV = {
  LIVE: {
    url: "",
  },

  STAGING: {
    url: "https://us-central1-ijgmms-development.cloudfunctions.net/monthEndRun",
  },

  DEVELOPMENT: {
    url: "",
  },

  TESTING: {
    url: "https://us-central1-ijgmms-testing.cloudfunctions.net/monthEndRun",
  },
};
