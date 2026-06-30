const PICKS_KEY = "sleeperDraftPicks";
const TEAMS_KEY = "sleeperTeamPicks";

function sendPicksToWebsite(picks, teams) {
  window.postMessage(
    {
      source: "sleeper-draft-extension",
      type: "DRAFT_PICKS_UPDATED",
      picks,
      teams,
    },
    window.location.origin,
  );
}

async function sendCurrentPicks() {
  const result = await chrome.storage.local.get([PICKS_KEY, TEAMS_KEY]);

  const picks = result[PICKS_KEY] ?? [];
  const teams = result[TEAMS_KEY] ?? [];

  sendPicksToWebsite(picks, teams);
}

// Send updates whenever Sleeper tab has a storage update
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  sendPicksToWebsite(
    changes[PICKS_KEY]?.newValue ?? [],
    changes[TEAMS_KEY]?.newValue ?? [],
  );
});

// Allow webpage to request the current value
window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }

  if (
    event.data?.source === "draft-website" &&
    event.data?.type === "REQUEST_DRAFT_PICKS"
  ) {
    void sendCurrentPicks();
  }
});

void sendCurrentPicks();
