export interface DraftedPlayer {
  playerId: string;
  name: string;
  overallPick: number;
  positionDetails: string;
}

export function useDraftBridge() {
  const draftedPlayers = useState<DraftedPlayer[]>("drafted-players", () => []);

  function startBridge() {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.source !== "sleeper-draft-extension" ||
        event.data?.type !== "DRAFT_PICKS_UPDATED"
      ) {
        return;
      }

      draftedPlayers.value = event.data.picks ?? [];
    }

    window.addEventListener("message", handleMessage);

    window.postMessage(
      {
        source: "draft-website",
        type: "REQUEST_DRAFT_PICKS",
      },
      window.location.origin,
    );

    return () => window.removeEventListener("message", handleMessage);
  }

  return {
    draftedPlayers,
    startBridge
  }
}
