<template>
  <div class="h-full">
    <div
      v-for="(history, historyCount) of histories"
      class="p-2 flex items-center justify-start cursor-pointer hover:bg-slate-300"
      @click="loadHistory(history.id)"
    >
      <div class="w-full flex justify-between items-center">
        <div class="flex">
          <div class="mr-2 w-4">{{ historyCount }}.</div>
          <div>{{ history.chartName }} {{ history.chartVersion }}</div>
        </div>

        <div class="text-right text-xs">{{ format(history.date) }}</div>
      </div>
    </div>

    <div
      class="flex justify-center absolute z-20 bottom-0 w-full h-16 left-0 right-0"
    >
      <button
        @click="$emit('close')"
        class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow absolute"
      >
        Close history
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { History, type HistoryItem } from "../storage/history";
import * as timeago from "timeago.js";

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
