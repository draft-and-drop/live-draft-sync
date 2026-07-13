<script setup lang="ts">
const { teams, draftedPlayers, startBridge } = useDraftBridge();
const { data: fpRankings } = useFetch("/api/fantasypros");
const { data: dsRankings } = useFetch("/api/draftsharks");
const { data: dkRankings } = useFetch("/api/draftkings");
const { data: fgRankings } = useFetch("/api/footballguys");

const { data: ffpcRankings } = useFetch("/api/ffpc");
// const { data: fantasyCalcRankings } = useFantasyCalc();

let stopBridge: (() => void) | undefined;

const isOpen = ref(true);

let draftedIds = computed(() => {
  return new Set(draftedPlayers.value.map((player) => player.sleeper_id));
});

let availableFpPlayers = computed(() => {
  return fpRankings.value?.filter((player) => isAvailable(player)) ?? [];
});

let availableDsPlayers = computed(() => {
  return dsRankings.value?.filter((player) => isAvailable(player)) ?? [];
});

let availableDkPlayers = computed(() => {
  return dkRankings.value?.filter((player) => isAvailable(player));
});

let availableFgPlayers = computed(() => {
  return fgRankings.value?.filter((player) => isAvailable(player));
});

// let availableFantasyCalcPlayers = computed(() => {
//   return fantasyCalcRankings.value?.filter((p) => !draftedIds.value.has(p.player.sleeperId));
// });

let availableFfpcPlayers = computed(() => {
  return ffpcRankings.value?.filter((player) => isAvailable(player));
});

function zebraStripes(index: number): string {
  return index % 2 === 0 ? 'bg-slate-200' : 'bg-white-300';
}

function isAvailable(player: any): boolean {
  console.assert(player.sleeper_id !== null, `Should always have a sleeper ID: ${player}`);
  return !draftedIds.value.has(player.sleeper_id);
}

onMounted(() => {
  stopBridge = startBridge();
});

onUnmounted(() => {
  stopBridge?.();
});

function positionColour(pos: string): string {
  switch (true) {
    case pos.startsWith("RB"):
      return "bg-green-300";
    case pos.startsWith("WR"):
      return "bg-blue-300";
    case pos.startsWith("TE"):
      return "bg-orange-300";
    case pos.startsWith("QB"):
      return "bg-red-300";
    case pos.startsWith("K"):
      return "bg-purple-300";
    case pos.startsWith("DEF"):
      return "bg-stone-300";
    default:
      return "bg-primary"
  }
}
</script>

<template>
  <!-- Underlay scroll container with dynamic height -->
  <div class="overflow-auto transition-all duration-300 ease-in-out"
    :class="isOpen ? 'h-[45vh]' : 'h-[calc(100vh-3.5rem)]'">
    <div class="flex justify-center gap-0.5 p-4">
      <div v-for="(team, teamIndex) in teams" class="gap-0.5 flex flex-col">
        <div class="text-center font-semibold">
          <div class="text-md m-1 truncate w-28">{{ team.team_name }}</div>
        </div>
        <div v-for="(player, playerIndex) in team.players" class="w-30 h-12 rounded-box overflow-hidden">

          <!-- Empty design if no player was drafted here yet -->
          <div v-if="player.name === 'nan'" class="w-full h-full bg-neutral-500 text-center content-center">
            <div class="flex justify-end">
              <div class="pr-1 text-primary-content/60 text-xxs text-center content-center">
                {{ playerIndex + 1 }}. {{ playerIndex % 2 == 0 ? (teamIndex + 1) : (teams.length - teamIndex) }}
              </div>
            </div>

            <div class="flex justify-between">

              <div class="pl-1">
                <div class="font-medium text-xxxs text-primary-content/65">
                  &nbsp
                </div>

                <div v-if="playerIndex % 2 === 0" class="flex align-center">
                  <Icon v-if="teamIndex === (teams.length - 1)" name="material-symbols:arrow-downward-rounded"
                    size="14" />
                  <Icon v-else name="material-symbols:arrow-forward-rounded" size="14" />
                </div>

                <div v-else class="flex align-center">
                  <Icon v-if="teamIndex === 0" name="material-symbols:arrow-downward-rounded" size="14" />
                  <Icon v-else name="material-symbols:arrow-back-rounded" size="14" />
                </div>
              </div>
            </div>
          </div>

          <!-- Design for a cell with a drafted player  -->
          <div v-else class="flex flex-col w-full h-full" :class="positionColour(player.position_details)">

            <div class="flex justify-between">
              <div class="pl-1 font-medium text-sm truncate w-23 text-primary-content">
                {{ player.name }}
              </div>

              <div class="pr-1 text-primary-content/60 text-xxs text-center content-center">
                {{ player.displayed_pick }}
              </div>
            </div>

            <div class="flex justify-between">

              <div class="pl-1">
                <div class="font-medium text-xxxs text-primary-content/65">
                  {{ player.position_details }}
                </div>

                <div v-if="playerIndex % 2 === 0" class="flex align-center">
                  <Icon v-if="teamIndex === (teams.length - 1)" name="material-symbols:arrow-downward-rounded"
                    size="14" />
                  <Icon v-else name="material-symbols:arrow-forward-rounded" size="14" />
                </div>

                <div v-else class="flex align-center">
                  <Icon v-if="teamIndex === 0" name="material-symbols:arrow-downward-rounded" size="14" />
                  <Icon v-else name="material-symbols:arrow-back-rounded" size="14" />
                </div>
              </div>


              <div>
                <img v-if="player.img_url && player.img_url !== 'nan'" :src="player.img_url" width="40">
                <Icon v-else name="material-symbols:sports-football-rounded" size="24" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom rankings sheet -->
  <section class="
      fixed inset-x-0 bottom-2 z-50
      flex h-[55vh] flex-col
      rounded-t-2xl bg-base-100 shadow-2xl
      transition-transform duration-300 ease-in-out
    " :class="isOpen
      ? 'translate-y-0'
      : 'translate-y-[calc(100%-3.5rem)]'
      ">

    <!-- Always-visible header/handle -->
    <button class="
        btn flex h-8 shrink-0 content-center items-center justify-between bg-black/30 rounded-t-xl lg:px-24
      " :aria-expanded="isOpen" aria-controls="bottom-menu-content" @click="isOpen = !isOpen">
      <span class="font-semibold">Rankings</span>

      <span class="flex transition-transform duration-300" :class="{ 'rotate-180': isOpen }">
        <Icon name="material-symbols:arrow-upward" size="25" />
      </span>
    </button>

    <!-- Scrollable content -->
    <!-- Ranking lists -->
    <div id="bottom-menu-content" class="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">

      <div class="flex justify-around gap-1">
        <div>
          <div class="bg-fantasy-pros/60 text-center rounded-2xl px-2 text-sm my-1.5">Fantasy Pros ECR</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFpPlayers" :key="player.player_id">
              <div v-if="index === 0 || player.tier !== availableFpPlayers[index - 1]?.tier"
                class="list-row bg-fantasy-pros/15 px-2 py-0 text-xs leading-tight rounded-none">Tier {{
                  player.tier }}</div>
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ index + 1 }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.player_position_id)"></div>
                    {{ player.player_position_id }} - {{ player.player_team_id }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <div class="bg-draft-sharks/60 text-center rounded-2xl px-2 text-sm my-1.5">Draft Sharks 3D</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableDsPlayers" :key="player.ds_id">
              <div v-if="index === 0 || player.overallTier !== availableDsPlayers[index - 1]?.overallTier"
                class="list-row bg-draft-sharks/15 px-2 py-0 text-xs leading-tight rounded-none ">Tier {{
                  player.overallTier }}</div>
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ index + 1 }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.position)"></div>
                    {{ player.position }} - {{ player.teamId }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>


        <div>
          <div class="bg-draft-kings/30 text-center rounded-2xl px-2 text-sm my-1.5">Draft Kings Best Ball (ADP)
          </div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableDkPlayers" :key="player.site_player_id">
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.curr_adp.toFixed(0) }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.pos)"></div>
                    {{ player.pos }} - {{ player.team }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <div class="bg-ffpc/30 text-center rounded-2xl px-2 text-sm my-1.5">FFPC $2K ADP</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFfpcPlayers" :key="index">
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.adp.toFixed(0) }}. {{ player.name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.position)"></div>
                    {{ player.position }} - {{ player.nflTeam }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>


        <div>
          <div class="bg-football-guys/30 text-center rounded-2xl px-2 text-sm my-1.5">Football Guys</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFgPlayers" :key="player.football_guys_id">
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ index + 1 }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.position)"></div>
                    {{ player.position }} - {{ player.team }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- <div>
      <div class="badge text-md my-2 tracking-wide bg-ff-trade-calc/85 p-2.5 text-white">FF Trade Value</div>
      <ul class="list bg-base-100 rounded-box shadow-md">
        <li v-for="(player, index) in availableFantasyCalcPlayers" :key="player.player.sleeperId">
          <div class="list-row py-2" :class="index % 2 === 0 ? 'bg-slate-200' : 'bg-white-300'">
            <div>
              <div>
                {{ player.player.name }}<span class="opacity-40"> ({{ player.value }})</span>
              </div>
              <div class="text-xs uppercase font-semibold opacity-60">
                <div class="badge badge-xs" :class="positionColour(player.player.position)">{{ player.player.position }}
                </div>
                {{ player.player.maybeTeam }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div> -->

      </div>
    </div>
  </section>
</template>