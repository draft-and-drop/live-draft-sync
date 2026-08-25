import {normalize, addToCSV} from "./mappings-helper";

const flockFantasyRes = await fetch(
  "https://api.flockfantasy.com/rankings?format=REDRAFT&pickType=hybrid&year=2025&deltaRankType=overall&deltaFormat=REDRAFT&deltaSubformat=1QB&includeRankingsPageGroups=true",
);

if (!flockFantasyRes.ok) {
    throw new Error(`HTTP Error: ${flockFantasyRes.status}`);
}

const data = await flockFantasyRes.json();

console.log(data.data);

const flockFantasyIds = new Map<string, string>(
  data.data.map((player: any) => [
    `${normalize(player.playerName)}`,
    player.playerId,
  ]),
);

addToCSV(flockFantasyIds, "flock_fantasy_id");
