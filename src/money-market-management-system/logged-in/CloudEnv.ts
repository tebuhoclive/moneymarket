interface CLOUD_ENV {
  name: string;
  url: string;
}

const LIVE_DB: CLOUD_ENV = {
  name: "Live",
  url: "https://us-central1-ijgmms.cloudfunctions.net/",
};

const STAGING_DB: CLOUD_ENV = {
  name: "Staging",
  url: "https://us-central1-ijgmms-development.cloudfunctions.net/",
};


const TEST_DB: CLOUD_ENV = {
  name: "Testing",
  url: "https://us-central1-ijgmms-testing.cloudfunctions.net/",
};

export const ACTIVE_ENV = STAGING_DB;
