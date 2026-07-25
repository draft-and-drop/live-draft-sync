export interface VegasPlayer {
  Player: string
  Position: string
  PlayerID: string
  Team: string
  PassYds: number
  PassTDs: number
  PassINTs: number
  RushYds: number
  RushTDs: number
  FantasyPoints: number
}

export function useVegasData() {
  return useAsyncData("vegas-multi-api", async () => {
    const [qbs, rbs, wrs, tes] = await Promise.all([
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/qb/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/rb/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/wr/rankings?bookmaker=Average",
      ),
      $fetch<VegasPlayer[]>(
        "https://vegasedgefantasy.com/predraft/te/rankings?bookmaker=Average",
      ),
    ]);

    return [...qbs, ...rbs, ...wrs, ...tes];
  });
}
