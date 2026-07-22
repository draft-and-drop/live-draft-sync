import fs from "node:fs";
import Papa from "papaparse";

type Row = Record<string, string>;

const file_name = "player_ids.csv";
const MAX_ENTRIES = 500;

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

function addToCSV(mappings: Map<string, string>, source_id: string): void {
  const csv = Papa.parse<Row>(fs.readFileSync(file_name, "utf8"), {
    header: true,
    skipEmptyLines: true,
  }).data;

  const updated = csv.map((player) => {
    const names = Object.entries(player)
      .filter(([column]) => column.endsWith("_name"))
      .map(([, name]) => name);

    const sourceId = names
      .map((name) => mappings.get(`${normalize(name)}`))
      .find(Boolean);

    return {
      ...player,
      [source_id]: sourceId ?? "",
    };
  });

  fs.writeFileSync(file_name, Papa.unparse(updated));

  console.log(`Mapped ${updated.filter((p) => p[source_id]).length} players`);
}

export { normalize, addToCSV, MAX_ENTRIES };
