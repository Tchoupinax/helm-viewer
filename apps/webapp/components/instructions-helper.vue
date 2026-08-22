<template>
  <div
    class="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-ink px-6 py-16"
  >
    <div class="absolute right-4 top-4">
      <ThemeToggle />
    </div>
    <HelmMark mark-class="h-16 w-16 text-signal" />

    <h1 class="mt-6 font-display text-4xl tracking-tight text-foam">
      helm-viewer
    </h1>
    <p class="mt-2 max-w-md text-center text-[15px] text-mist">
      Ready to gather your Helm charts. Render locally, inspect the templates,
      then share an encrypted link if you want to.
    </p>

    <div class="mt-10 w-full max-w-xl space-y-3">
      <button
        v-for="command in commands"
        :key="command"
        class="group flex w-full items-center justify-between gap-4 rounded-lg bg-harbor px-4 py-3 text-left ring-1 ring-line transition-colors hover:ring-signal/40"
        type="button"
        @click="copyText(command)"
      >
        <code class="font-mono text-[13px] text-signal">{{ command }}</code>
        <span class="text-[11px] uppercase tracking-wider text-mist group-hover:text-foam">
          {{ copied === command ? "Copied" : "Copy" }}
        </span>
      </button>
    </div>

    <div v-if="histories.length" class="mt-12 w-full max-w-xl">
      <p
        class="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mist"
      >
        Recent charts
      </p>
      <div class="overflow-hidden rounded-lg ring-1 ring-line">
        <button
          v-for="history of histories.slice(0, 6)"
          :key="history.id"
          class="flex w-full items-center justify-between gap-3 border-b border-line bg-harbor px-4 py-2.5 text-left last:border-b-0 hover:bg-dock"
          type="button"
          @click="loadHistory(history.id)"
        >
          <span class="truncate text-[13px] text-foam">
            {{ history.chartName }}
            <span class="ml-2 font-mono text-[11px] text-mist">{{
              history.chartVersion
            }}</span>
          </span>
          <span class="shrink-0 font-mono text-[11px] text-mist">{{
            format(history.date)
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as timeago from "timeago.js";

import { History, type HistoryItem } from "../storage/history";

export default {
  data(): {
    copied: string;
    commands: string[];
    histories: HistoryItem[];
  } {
    return {
      copied: "",
      commands: [
        "npm i -g helm-viewer",
        "helm-viewer path/to/your/chart",
        "helm-viewer --help",
      ],
      histories: [],
    };
  },
  mounted() {
    this.histories = History.list().reverse();
  },
  methods: {
    format: timeago.format,
    loadHistory(historyId: string) {
      window.location.assign(`/?id=${historyId}`);
    },
    async copyText(command: string) {
      try {
        await navigator.clipboard.writeText(command);
        this.copied = command;
        setTimeout(() => {
          if (this.copied === command) {
            this.copied = "";
          }
        }, 1600);
      } catch {
        this.copied = "";
      }
    },
  },
};
</script>
