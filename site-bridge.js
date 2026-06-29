const STORAGE_KEY = "sleeperDraftPicks";
const TEAMS = "sleeperTeamPicks";

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
  const result = await chrome.storage.local.get([STORAGE_KEY, TEAMS]);

  const picks = result[STORAGE_KEY] ?? [];
  const teams = result[TEAMS] ?? [];

  // console.log("teams", teams)

  sendPicksToWebsite(picks, teams);
}

// Send updates whenever Sleeper tab has a storage update
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  sendPicksToWebsite(
    changes[STORAGE_KEY]?.newValue ?? [],
    changes[TEAMS]?.newValue ?? [],
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
