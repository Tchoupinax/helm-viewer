<template>
  <div class="h-full w-full">
    <div 
      v-for="history of histories"
      class="p-2 flex items-center justify-start cursor-pointer hover:bg-slate-300"
      @click="loadHistory(history.id)"
    >
      {{ history.chartName }} {{ history.chartVersion }}
    </div>
  </div>
</template>

<script lang="ts">
import { History, HistoryItem } from '../storage/history'

type Store = {
  histories: Array<HistoryItem>;
}

export default {
  data(): Store {
    return {
      histories: []
    }
  },
  mounted() {
    this.histories = History.list().reverse();
  },
  methods: {
    loadHistory(historyId: string) {
      window.location = `/?id=${historyId}`
    }
  }
};
</script>