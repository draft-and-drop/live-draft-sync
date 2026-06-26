import fs from "node:fs";
import Papa from "papaparse";
import { parse } from "node-html-parser";

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

const html = await fetch(
  "https://www.draftsharks.com/rankings/load-rows?offset=0&limit=255&fantasyPosition=&pprSuperflexSlug=ppr&sort=-dsValue&researchDepth=rankings",
).then((response) => response.text());

const draftSharksIds = new Map(
  parse(html)
    .querySelectorAll("tbody[data-player-row]")
    .filter((element) => ["QB", "WR", "RB", "TE", "K", "DEF"].includes(element.getAttribute("data-fantasy-position") ?? ""))
    .map((player) => [
      `${normalize(player.getAttribute("data-player-name"))}`,
      player.getAttribute("data-key")!,
    ]),
);

const updated = csv.map((player) => {
  const names = Object.entries(player)
    .filter(([column]) => column.endsWith("_name"))
    .map(([, name]) => name);

    
    const draftSharksId = names
    .map((name) => draftSharksIds.get(`${normalize(name)}`))
    .find(Boolean);

  return {
    ...player,
    draft_sharks_id: draftSharksId ?? "",
  };
});

fs.writeFileSync(file_name, Papa.unparse(updated));

console.log(
  `Mapped ${updated.filter((p) => p.draft_sharks_id).length} players`,
);
