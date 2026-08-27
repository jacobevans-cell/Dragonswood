// Dragonswood Arcade runtime configuration.
// Firebase web configuration values are public identifiers, not secret keys.
// NEVER put R2 API tokens, Firebase service-account keys, or other private credentials here.
window.DRAGONSWOOD_ARCADE_CONFIG = {
  firebase: {
    enabled: false,
    authMode: 'anonymous',
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  },
  leaderboard: {
    timezone: 'America/Phoenix',
    topN: 5,
    rewardWeekdaysOnly: true,
    localDailyRetentionDays: 60,
    localWeeklyRetentionDays: 735
  },
  rewards: {
    directGameRewardsEnabled: false,
    directClassPointsWritesEnabled: false,
    firstPlaceFlag: 'CHAMPIONS_CHOICE',
    // Current Dragonswood rule: first place on ANY arcade board makes that student
    // Champion's Choice eligible for that day. Eligibility still collapses to one
    // teacher-reviewed daily record per student.
    championsChoiceScope: 'per-board-first-place',
    teacherReviewRequired: true
  },
  performance: {
    defaultMode: 'auto',
    lowFpsThreshold: 42,
    chromebookLowMemoryGb: 4,
    chromebookLowCoreCount: 4
  },
  customMusic: {
    requireHttps: true,
    // Optional hostname allowlist. Leave empty to allow any HTTPS host while still
    // requiring the level creator to use audio they own or are licensed to use.
    allowedHosts: []
  },
  r2: {
    publicBaseUrl: ''
  }
};
