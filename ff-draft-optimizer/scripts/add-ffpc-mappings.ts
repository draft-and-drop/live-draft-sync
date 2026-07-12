import fs from "node:fs";
import Papa from "papaparse";
import { XMLParser } from "fast-xml-parser";

type Row = Record<string, string>;

const file_name = "player_ids.csv";
const MAX_ENTRIES = 500;

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const csv = Papa.parse<Row>(fs.readFileSync(file_name, "utf8"), {
  header: true,
  skipEmptyLines: true,
}).data;

const rawXML = await fetch("https://myffpc.com/FFPCADPReport.ashx", {
  params: {
    draftStartDateFrom: "01Jul2026",
    draftStartDateTo: "11Dec2026",
    leagueTypeID: 1,
    superflexFilter: 0,
    slimRostersFilter: 0,
  },
}).then((response) => response.text());

const numericAttrs = new Set(["adp", "min", "max", "leaguesDraftedIn"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  isArray: (_, path) => path === "data.players.player",
  attributeValueProcessor: (name, value) =>
    numericAttrs.has(name) ? Number(value) : value,
});

const ffpcIds = new Map(
  parser
    .parse(rawXML)
    .data.players.player
    .slice(0, MAX_ENTRIES)
    .map((player) => [
      `${normalize(player["name"])}`,
      player["sportsDataForeignKey"],
    ]),
);

const updated = csv.map((player) => {
  const names = Object.entries(player)
    .filter(([column]) => column.endsWith("_name"))
    .map(([, name]) => name);

  const ffpcId = names
    .map((name) => ffpcIds.get(`${normalize(name)}`))
    .find(Boolean);

  return {
    ...player,
    ffpc_id: ffpcId ?? "",
  };
});

fs.writeFileSync(file_name, Papa.unparse(updated));

console.log(
  `Mapped ${updated.filter((p) => p.ffpc_id).length} players`,
);
