import playerIdMapJson from "#server/data/fp-sleeper-id-map.json";

interface FantasyProsRankingsResponse {
  players: FantasyProsPlayerDTO[];
}

interface FantasyProsPlayerDTO {
  player_id: number;
  player_name: string;
  rank_ecr: number;
  rank_ave: string;
  player_position_id: string;
  player_team_id: string;
  tier: number;
  sleeper_id: string | null;
}

const playerIdMap = playerIdMapJson as Record<string, string>;
const MAX_ENTRIES = 300;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const query = getQuery(event);

  if (!config.fantasyProsApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "FantasyPros API key is not configured",
    });
  }

  const response = await $fetch<FantasyProsRankingsResponse>(
    `https://api.fantasypros.com/public/v2/json/nfl/2026/consensus-rankings`,
    {
      headers: {
        "x-api-key": config.fantasyProsApiKey,
      },
      query: {
        position: "ALL",
        scoring: query.format,
        type: "DRAFT",
      },
    },
  );

  return response.players.slice(0, MAX_ENTRIES).map((player) => ({
    ...player,
    sleeper_id: playerIdMap[String(player.player_id)] ?? null,
  }));
});
