import fs from "node:fs";
import Papa from "papaparse";

type Row = Record<string, string>;

const file_name = "player_ids.csv";

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const csv = Papa.parse<Row>(fs.readFileSync(file_name, "utf8"), {
  header: true,
  skipEmptyLines: true,
}).data;

const draftSharksRes = await fetch(
  "https://www.occupyfantasyapi.com/best_ball/adps?site=draftkings&contest=all",
);

if (!draftSharksRes.ok) {
    throw new Error(`HTTP Error: ${draftSharksRes.status}`);
}

const data = await draftSharksRes.json();

const draftKingsIds = new Map(
  data.adps.map((player: any) => [
    `${normalize(player.player_name)}`,
    player.site_player_id,
  ]),
);

const updated = csv.map((player) => {
  const names = Object.entries(player)
    .filter(([column]) => column.endsWith("_name"))
    .map(([, name]) => name);

  const draftKingsId = names
    .map((name) => draftKingsIds.get(`${normalize(name)}`))
    .find(Boolean);

  return {
    ...player,
    draft_kings_id: draftKingsId ?? "",
  };
});

fs.writeFileSync(file_name, Papa.unparse(updated));

console.log(
  `Mapped ${updated.filter((p) => p.draft_kings_id).length} players`,
);
