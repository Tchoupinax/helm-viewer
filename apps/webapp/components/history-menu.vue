<template>
  <aside
    class="absolute inset-y-0 right-0 z-40 flex w-96 max-w-full flex-col border-l border-line bg-harbor shadow-2xl shadow-black/40"
  >
    <div class="flex items-center justify-between border-b border-line px-4 py-3">
      <div>
        <p class="font-display text-lg text-foam">History</p>
        <p class="text-[12px] text-mist">Previously opened charts</p>
      </div>
      <button
        class="rounded-md px-2 py-1 text-[12px] text-mist ring-1 ring-line transition-colors hover:bg-dock hover:text-foam"
        type="button"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-2">
      <button
        v-for="history of histories"
        :key="history.id"
        class="mb-1 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-dock"
        type="button"
        @click="loadHistory(history.id)"
      >
        <div class="min-w-0">
          <p class="truncate text-[13px] font-medium text-foam">
            {{ history.chartName }}
          </p>
          <p class="mt-0.5 font-mono text-[11px] text-mist">
            {{ history.chartVersion }}
          </p>
        </div>
        <span class="shrink-0 font-mono text-[11px] text-mist">
          {{ format(history.date) }}
        </span>
      </button>

      <p
        v-if="histories.length === 0"
        class="px-3 py-10 text-center text-[13px] text-mist"
      >
        No charts in history yet.
      </p>
    </div>
  </aside>
</template>

<script lang="ts">
import * as timeago from "timeago.js";

import { History, type HistoryItem } from "../storage/history";

type Store = {
  histories: Array<HistoryItem>;
};

export default {
  emits: ["close"],
  data(): Store {
    return {
      histories: [],
    };
  },
  mounted() {
    this.histories = History.list().reverse();
  },
  methods: {
    loadHistory(historyId: string) {
      window.location.assign(`/?id=${historyId}`);
    },
    format: timeago.format,
  },
};
</script>
