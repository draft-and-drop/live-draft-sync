export interface FantasyCalcPlayerDTO {
  player: {
    name: string;
    sleeperId: string;
    position: string;
    maybeTeam: string;
  };
  value: string;
  overallRank: number;
  positionRank: number;
  maybeTier: number;
}

export function useFantasyCalc() {
  return useFetch<FantasyCalcPlayerDTO[]>(
    "https://api.fantasycalc.com/values/current",
    {
      query: {
        isDynasty: false,
        numQbs: 1,
        numTeams: 10,
        ppr: 1,
      },
    },
  );
}
