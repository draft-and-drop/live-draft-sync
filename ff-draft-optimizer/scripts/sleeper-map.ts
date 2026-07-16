import { readFile, mkdir, writeFile } from "node:fs/promises";
import Papa from "papaparse";

interface PlayerIdRow {
  [columnName: string]: string;
  sleeper_id?: string;
}

async function createSleeperMap(
  sourceColumnName: string,
  filenamePrefix: string,
) {
  const csv = await readFile("player_ids.csv", "utf8");

  const { data, errors } = Papa.parse<PlayerIdRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length) {
    console.warn("CSV parsing errors:", errors);
  }

  const playerIdMap = Object.fromEntries(
    data
      .filter((row) => row[sourceColumnName] && row.sleeper_id)
      .map((row) => [row[sourceColumnName], row.sleeper_id!]),
  );

  await mkdir("server/data", { recursive: true });

  await writeFile(`server/data/${filenamePrefix}-sleeper-id-map.json`, JSON.stringify(playerIdMap, null, 2));

  console.log(`Created ${Object.keys(playerIdMap).length} mappings`);
}

await createSleeperMap(process.argv[2], process.argv[3]);
