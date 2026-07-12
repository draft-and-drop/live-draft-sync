import { readFile, mkdir, writeFile } from "node:fs/promises"
import Papa from "papaparse"

interface PlayerIdRow {
  fantasypros_id?: string
  sleeper_id?: string
}

const csv = await readFile("player_ids.csv", "utf8")

const { data, errors } = Papa.parse<PlayerIdRow>(csv, {
  header: true,
  skipEmptyLines: true
})

if (errors.length) {
  console.warn("CSV parsing errors:", errors)
}

const playerIdMap = Object.fromEntries(
  data
    .filter(row => row.ffpc_id && row.sleeper_id)
    .map(row => [
      row.ffpc_id!,
      row.sleeper_id!
    ])
)

await mkdir("server/data", { recursive: true })

await writeFile(
  "server/data/ffpc-sleeper-id-map.json",
  JSON.stringify(playerIdMap, null, 2)
)

console.log(
  `Created ${Object.keys(playerIdMap).length} mappings`
)