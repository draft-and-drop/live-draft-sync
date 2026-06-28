<script setup lang="ts">
const { draftedPlayers, startBridge } = useDraftBridge();
const { data: fpRankings } = useFetch("/api/fantasypros");
const { data: dsRankings } = useFetch("/api/draftsharks");
const { data: dkRankings } = useFetch("/api/draftkings");
const { data: fgRankings } = useFetch("/api/footballguys");

let stopBridge: (() => void) | undefined;

let draftedIds = computed(() => {
  return new Set(draftedPlayers.value.map((player) => player.playerId));
});

let availableFpPlayers = computed(() => {
  return fpRankings.value?.filter((player) => isAvailable(player));
});

let availableDsPlayers = computed(() => {
  return dsRankings.value?.filter((player) => isAvailable(player));
});

let availableDkPlayers = computed(() => {
  return dkRankings.value?.filter((player) => isAvailable(player));
});

let availableFgPlayers = computed(() => {
  return fgRankings.value?.filter((player) => isAvailable(player));
});

function isAvailable(player: any): boolean {
  console.assert(player.sleeper_id !== null, "Should always have a sleeper ID");
  return !draftedIds.value.has(player.sleeper_id);
}

onMounted(() => {
  stopBridge = startBridge();
});

onUnmounted(() => {
  stopBridge?.();
});
</script>

<template>
  <p>{{ draftedPlayers.length }} player(s) drafted</p>

  <ul style="display: flex">
    <li v-for="player in draftedPlayers" :key="player.playerId">
      <div style="padding: 0.2rem">
        <div>{{ player.overallPick }}. {{ player.name }}</div>
        <div>
          {{ player.positionDetails }}
        </div>
      </div>
    </li>
  </ul>

  <br />

  <div style="display: flex">
    <div>
      <div>Fantasy Pros ECR</div>
      <ul>
        <li
          v-for="(player, index) in availableFpPlayers"
          :key="player.player_id"
        >
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.player_position_id }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Draft Sharks</div>
      <ul>
        <li v-for="(player, index) in availableDsPlayers" :key="player.ds_id">
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.position }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Draft Kings (Best Ball ADP)</div>
      <ul>
        <li
          v-for="(player, index) in availableDkPlayers"
          :key="player.site_player_id"
        >
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }} -- {{ player.pos }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div>Football Guys</div>
      <ul>
        <li
          v-for="(player, index) in availableFgPlayers"
          :key="player.football_guys_id"
        >
          <div style="padding: 0.2rem">
            <div>
              {{ index + 1 }}. ({{ player.sleeper_id }})
              {{ player.player_name }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
