<script setup lang="ts">
const selectedScoringId = ref(0);
const scoringFormats = ref([
  { id: 0, fp_id: "PPR", ds_id: "ppr", name: 'PPR', },
  { id: 1, fp_id: "HALF", ds_id: "half-ppr", name: 'Half-PPR', },
  { id: 2, fp_id: "STD", ds_id: "", name: 'Standard', }
]);

const selectedFormat = computed(() =>
  scoringFormats.value.find((sf) => sf.id === selectedScoringId.value) ?? scoringFormats.value[0]
);

const fpFormat = computed(() => selectedFormat.value?.fp_id ?? "PPR");
const dsFormat = computed(() => selectedFormat.value?.ds_id ?? "ppr");

const selectedPosition = ref("All");
const positions = ref([
  { id: 0, name: "All" },
  { id: 1, name: "QB" },
  { id: 2, name: "RB" },
  { id: 3, name: "WR" },
  { id: 4, name: "TE" },
]);

const { teams, draftedPlayers, startBridge } = useDraftBridge();
const { data: fpRankings } = useFetch("/api/fantasypros", { query: { format: fpFormat } });
const { data: dsRankings } = useFetch("/api/draftsharks", { query: { format: dsFormat } });
const { data: adpRankings } = useFetch("/api/adp", { query: { format: fpFormat } });
const { data: fgRankings } = useFetch("/api/footballguys");
const { data: flockRankings, pending: flockPending, error: flockError } = await useFetch('/api/flock')
const { data: vegasData, pending: vegasLoading, error: vegasError } = useVegasData();

const vegasPlayers = computed(() => vegasData.value?.vegasPlayers ?? []);
const nflTeams = computed(() => vegasData.value?.nflTeams ?? []);

let topOffence = computed(() => new Set(nflTeams.value.slice(0, 6).map(t => t.abbr)));
let bottomOffence = computed(() => new Set(nflTeams.value.slice(-6).map(t => t.abbr)));

let stopBridge: (() => void) | undefined;

const isOpen = ref(true);

let draftedIds = computed(() => {
  return new Set(draftedPlayers.value.map((player) => player.sleeper_id));
});

let availableFpPlayers = computed(() => {
  return fpRankings.value?.filter((player) => isAvailable(player) && (selectedPosition.value === "All" || player.player_position_id === selectedPosition.value)) ?? [];
});

let availableDsPlayers = computed(() => {
  return dsRankings.value?.filter((player) => isAvailable(player) && (selectedPosition.value === "All" || player.position === selectedPosition.value)) ?? [];
});

let availableFgPlayers = computed(() => {
  return fgRankings.value?.filter((player) => isAvailable(player) && (selectedPosition.value === "All" || player.position === selectedPosition.value)) ?? [];
});

let availableAdpPlayers = computed(() => {
  return adpRankings.value?.filter(player => isAvailable(player) && (selectedPosition.value === "All" || player.player_position_id === selectedPosition.value)) ?? [];
});

let availableFlockPlayers = computed(() => {
  return flockRankings.value?.filter(player => !draftedIds.value.has(player.sleeper_id) && (selectedPosition.value === "All" || player.position === selectedPosition.value)) ?? [];
});

let availableVegasPlayers = computed(() => {
  return availableAdpPlayers.value?.map(player => {
    const vegasPlayer = vegasPlayers.value.find(vegasPlayer => vegasPlayer.PlayerID === player.sleeper_id);
    return { VegasPlayer: vegasPlayer, ...player };
  })
})


let currentPickNumber = computed(() => {
  const index = draftedPlayers.value.findIndex(pick => pick.name === "nan" || pick.name === "NEXT_PICK");
  
  // If no empty slot is found (e.g. data is loading), default to Pick 1 
  return index === -1 ? 1 : index + 1; 
});

let totalRounds = computed(() => teams.value.at(0)?.players.length ?? 0);

let pickSlot = ref(1);

let pickSlots = computed(() => {
  let pickValues = [];
  for (let i = 0; i < totalRounds.value; i++) {
    if (i % 2 == 0) {
      pickValues.push(i * teams.value.length + pickSlot.value);
    } else {
      pickValues.push((i + 1) * teams.value.length - pickSlot.value + 1);
    }
  }

  return pickValues.map(n => n - currentPickNumber.value).filter(n => n >= 0);
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

function injuryColour(level: string): string {
  switch (true) {
    case level === "low":
      return "bg-green-300";
    case level === "mild":
      return "bg-yellow-300";
    case level === "medium":
      return "bg-orange-300";
    default:
      return "bg-red-300"
  }
}

function teamColour(rank: number): string {
  switch (true) {
    case rank < 5:
      return "bg-green-200";
    case rank > 26:
      return "bg-red-200";
    default:
      return "bg-gray-200";
  }
}
</script>

<template>

  <!-- Underlay scroll container with dynamic height -->
  <div class="overflow-auto transition-all duration-300 ease-in-out"
    :class="isOpen ? 'h-[45vh]' : 'h-[calc(100vh-3.5rem)]'">
    <div class="flex w-full gap-0.5 px-[clamp(0px,(100vw-1200px)/10,6rem)] py-2">
      <div v-for="(team, teamIndex) in teams" class="gap-0.5 flex flex-col flex-1 min-w-30">
        <div class="text-center font-semibold">
          <div class="group m-1 w-auto truncate rounded-box text-center font-semibold" :class="teamIndex + 1 === pickSlot
            ? 'bg-green-700 text-white'
            : 'cursor-pointer hover:bg-green-700/20'" @click="pickSlot = teamIndex + 1">
            <span v-if="teamIndex + 1 === pickSlot">
              My Team
            </span>

            <template v-else>
              <span class="group-hover:hidden">{{ team.team_name }}</span>
              <span class="hidden group-hover:inline text-white/70">Select</span>
            </template>
          </div>

        </div>
        <div v-for="(player, playerIndex) in team.players" class="w-full min-w-30 h-12 rounded-box overflow-hidden">

          <!-- Design for when no player was drafted here yet or this is the next pick -->
          <div v-if="player.name === 'nan' || player.name === 'NEXT_PICK'"
            class="w-full h-full text-center content-center static"
            :class="player.name === 'NEXT_PICK' ? 'bg-yellow-400' : 'bg-neutral-500'">
            <div class="flex justify-end">
              <div class="pr-1 text-primary-content/60 text-xxs text-center content-center">
                {{ playerIndex + 1 }}. {{ playerIndex % 2 == 0 ? (teamIndex + 1) : (teams.length - teamIndex) }}
              </div>
            </div>

            <div v-if="player.name === 'NEXT_PICK'" class="font-bold text-xs text-yellow-950 text-center">
              {{ player.position_details }}
            </div>

            <div class="flex justify-between">

              <div class="pl-1">
                <div v-if="player.name === 'nan'" class="font-medium text-xxxs text-primary-content/65">
                  &nbsp
                </div>

                <div v-if="playerIndex % 2 === 0" class="flex align-center ">
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
      ? 'translate-y-2'
      : 'translate-y-[calc(100%-3rem)]'
      ">

    <!-- Always-visible header/handle -->
    <div class="
        flex h-8 shrink-0 content-center items-center justify-between bg-black/30 rounded-t-xl lg:px-24
      " :aria-expanded="isOpen" aria-controls="bottom-menu-content">

      <div>Pick: {{ currentPickNumber }}</div>

      <div>{{ pickSlot }}</div>

      <button class="btn btn-xs btn-ghost" onclick="my_modal_1.showModal()">
        <span class="text-sm">Strategy</span>
        <Icon name="material-symbols:help-outline-rounded" size="20" />
      </button>

      <div class="flex gap-2">
        <select class="select select-xs w-fit" v-model.number="selectedScoringId">
          <option disabled value="">Scoring Format</option>
          <option v-for="sf in scoringFormats" :key="sf.id" :value="sf.id">
            {{ sf.name }}
          </option>
        </select>

        <select class="select select-xs w-fit" v-model="selectedPosition">
          <option disabled value="">Positions</option>
          <option v-for="pos in positions" :key="pos.id" :value="pos.name">
            {{ pos.name }}
          </option>
        </select>
      </div>

      <dialog id="my_modal_1" class="modal">
        <div class="modal-box w-fit">
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-bold">Draft Strategies</h3>
            <h1>1. Double Anchor RB</h1>
            <h1>2. Late QB/TE</h1>
            <h1>3. Balanced</h1>
          </div>
          <div class="modal-action">
            <form method="dialog">
              <div class="flex gap-2">
                <button class="btn">Close</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>


      <button class="btn btn-xs btn-ghost" @click="isOpen = !isOpen">
        <span class="text-sm">{{ isOpen ? 'Hide' : 'Show' }}</span>
        <span class="flex transition-transform duration-300" :class="{ 'rotate-180': isOpen }">
          <Icon name="material-symbols:arrow-upward" size="25" />
        </span>
      </button>

    </div>

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
                    {{ player.rank_ecr }}. {{ player.player_name }}
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
          <div class="bg-draft-sharks/60 text-center rounded-2xl px-2 text-sm my-1.5">Draft Sharks 3DR</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableDsPlayers" :key="player.ds_id">
              <div v-if="index === 0 || player.overallTier !== availableDsPlayers[index - 1]?.overallTier"
                class="list-row bg-draft-sharks/15 px-2 py-0 text-xs leading-tight rounded-none ">Tier {{
                  player.overallTier }}</div>
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.overall_pick }}. {{ player.player_name }}
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
          <div class="bg-football-guys/30 text-center rounded-2xl px-2 text-sm my-1.5">Football Guys (12 PPR)</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFgPlayers" :key="player.football_guys_id">
              <!-- <div v-if="index % teams.length === 0"
                class="list-row bg-football-guys/15 px-2 py-0 text-xs leading-tight rounded-none ">Round {{
                  index / teams.length + 1 }}</div> -->

              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.overall_pick }}. {{ player.player_name }}
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
          <div class="bg-football-guys/30 text-center rounded-2xl px-2 text-sm my-1.5">Football Guys (12 PPR)</div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFgPlayers" :key="player.football_guys_id">
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.overall_pick }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.position)"></div>
                    {{ player.position }} - {{ player.team }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div> -->



        <div>
          <div class="bg-pink-500/30 text-center rounded-2xl px-2 text-sm my-1.5">ADP + Implied Points
          </div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableVegasPlayers" :key="player.player_id">
              <div class="list-row grid grid-cols-6 justify-between text-xs py-1.5 rounded-none"
                :class="zebraStripes(index)">
                <div class="col-span-4">
                  <div>
                    {{ player.rank_ecr }}. {{ player.player_name }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60 flex gap-2">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.player_position_id)"></div>
                    {{ player.player_position_id }} - {{ player.player_team_id }}
                  </div>
                </div>
                <div class="col-span-2 flex text-right items-center font-semibold opacity-80 gap-2">{{
                  player.VegasPlayer?.FantasyPoints }}
                  <div v-if="bottomOffence.has(player.player_team_id)" class="badge badge-xs bg-red-200">!</div>
                  <div v-else-if="topOffence.has(player.player_team_id)" class="badge badge-xs bg-green-200">✓</div>
                </div>
              </div>
              <div v-if="pickSlots.includes(index) && selectedPosition === 'All'"
                class="bg-pink-300/45 px-1 leading rounded-none text-xxxs font-medium ">Proj.
                next pick
              </div>
            </li>
          </ul>
        </div>

        <div>
          <div class="bg-orange-300 text-center rounded-2xl px-2 text-sm my-1.5">Flock Fantasy
          </div>
          <ul class="list shadow-md">
            <li v-for="(player, index) in availableFlockPlayers" :key="player.playerId">
              <div class="list-row text-xs py-1.5 rounded-none" :class="zebraStripes(index)">
                <div>
                  <div>
                    {{ player.averageRank }}. {{ player.playerName }}
                  </div>
                  <div class="text-xxs uppercase font-semibold opacity-60 flex gap-2">
                    <div class="badge [--size:0.60rem]" :class="positionColour(player.position)"></div>
                    {{ player.position }} - {{ player.team }} <div v-if="player.injury"
                      class="tooltip tooltip-accent rounded-2xl px-1" :class="injuryColour(player.injury.concernLevel)"
                      :data-tip="player.injury.expectedReturn + player.injury.doctorNotes">
                      <button>{{ player.injury?.concernLevel }}</button>
                    </div>
                  </div>

                </div>
              </div>
              <div v-if="pickSlots.includes(index) && selectedPosition === 'All'"
                class="bg-orange-300  px-1 leading rounded-none text-xxxs font-medium ">Proj.
                next pick
              </div>
            </li>
          </ul>
        </div>

        <div>
          <div class="bg-orange-400/30 text-center rounded-2xl px-2 text-sm my-1.5">Offensive Projections
          </div>
          <ul class="list shadow-md">
            <li v-for="(team, index) in nflTeams" :key="team.abbr">
              <div class="flex justify-around px-2 py-1 text-xs leading-tight rounded-none" :style="`background-color: color-mix(in srgb, ${index / (nflTeams.length - 1) < 0.5
                ? `color-mix(in srgb, rgb(107, 114, 128) ${Math.min((index / (nflTeams.length - 1)) * 400, 100)}%, rgb(34, 255, 94))`
                : `color-mix(in srgb, rgb(255, 0, 0) ${Math.min(Math.max(0, (index / (nflTeams.length - 1) - 0.75) * 400), 100)}%, rgb(107, 114, 128))`
                } 20%, transparent)`">
                <div>{{ index + 1 }}</div>
                <div class="flex">
                  <div class="badge badge-xs text-white/80"
                    :style="`background: linear-gradient(135deg, ${team.color} 0%, rgba(0,0,0,0.4) 100%)`">{{ team.abbr
                    }}

                  </div>
                </div>
                <div>{{ team.ppg }}</div>
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>
  </section>
</template>