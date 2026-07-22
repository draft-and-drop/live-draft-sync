import { XMLParser } from "fast-xml-parser";
import { normalize, addToCSV, MAX_ENTRIES } from "./mappings-helper";

const url = new URL("https://myffpc.com/FFPCADPReport.ashx");
url.search = new URLSearchParams({
  draftStartDateFrom: "01Jul2026",
  draftStartDateTo: "11Dec2026",
  leagueTypeID: "1",
  superflexFilter: "0",
  slimRostersFilter: "0",
}).toString();

const rawXML = await fetch(url).then((response) => response.text())

const numericAttrs = new Set(["adp", "min", "max", "leaguesDraftedIn"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  isArray: (_, path) => path === "data.players.player",
  attributeValueProcessor: (name, value) =>
    numericAttrs.has(name) ? Number(value) : value,
});

const ffpcIds = new Map<string, string>(
  parser
    .parse(rawXML)
    .data.players.player.slice(0, MAX_ENTRIES)
    .map((player: any) => [
      `${normalize(player["name"])}`,
      player["sportsDataForeignKey"],
    ]),
);

addToCSV(ffpcIds, "ffpc_id");
