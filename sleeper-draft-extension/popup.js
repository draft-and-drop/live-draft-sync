const STORAGE_KEY = "sleeperDraftPicks";

const statusElement = document.getElementById("status");
const picksElement = document.getElementById("picks");

function renderPicks(picks) {
  picksElement.replaceChildren();

  if (!Array.isArray(picks) || picks.length === 0) {
    statusElement.textContent = "No drafted players detected.";
    return;
  }

  let pickCount = 0;
  for (const pick of picks) {
    if (pick.name !== "nan") {
        const row = document.createElement("div");
        row.className = "pick";
    
        const title = document.createElement("div");
        title.className = "pick-number";
        title.textContent =
          `${pick.displayed_pick ?? pick.displayed_pick}: ` +
          `${pick.name ?? "Unknown player"}`;
    
        const details = document.createElement("div");
        details.textContent = pick.positionDetails ?? "";
    
        const playerId = document.createElement("div");
        playerId.className = "player-id";
        playerId.textContent = `Sleeper ID: ${pick.sleeper_id}`;
    
        row.append(title, details, playerId);
        picksElement.appendChild(row);
        pickCount++;
    }
  }

    statusElement.textContent = `${pickCount} players drafted`;
}

async function loadCurrentPicks() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  renderPicks(result[STORAGE_KEY] ?? []);
}

// Runs while the popup is open.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  const change = changes[STORAGE_KEY];

  if (change) {
    renderPicks(change.newValue ?? []);
  }
});

loadCurrentPicks();
