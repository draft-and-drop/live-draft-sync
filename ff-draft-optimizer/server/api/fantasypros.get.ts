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
  team_id: string;
  tier: number;
  sleeper_id: string | null;
}

const playerIdMap = playerIdMapJson as Record<string, string>;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

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
        scoring: "PPR",
        type: "ADP",
      },
    },
  );

  return response.players.map((player) => ({
    ...player,
    sleeper_id: playerIdMap[String(player.player_id)] ?? null,
  }));
});
