<template>
  <div class="mb-1">
    <button
      class="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-dock"
      :class="{ 'bg-dock/70': showFiles }"
      type="button"
      @click="onSelected"
    >
      <span
        class="flex h-4 w-4 shrink-0 items-center justify-center text-mist transition-transform"
        :class="{ 'rotate-90 text-foam': showFiles }"
      >
        <svg class="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4 2.2 8.4 6 4 9.8V2.2Z" />
        </svg>
      </span>
      <span
        class="h-1.5 w-1.5 shrink-0 rounded-full"
        :class="kindDot"
      />
      <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-foam">
        {{ name }}
      </span>
      <span
        class="rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] leading-none text-mist ring-1 ring-line"
      >
        {{ Object.keys(template).length }}
      </span>
    </button>

    <div v-if="showFiles" class="ml-3 border-l border-line pl-2">
      <button
        v-for="file of Object.keys(template)"
        :key="file"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors"
        :class="
          file === selectedFile
            ? 'bg-signal/10 text-signal'
            : 'text-mist hover:bg-dock hover:text-foam'
        "
        type="button"
        @click="onFileSelected(file)"
      >
        <span class="min-w-0 flex-1 truncate font-mono text-[12px]">
          {{ file }}
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export type Store = {
  selected: boolean;
  showFiles: boolean;
  selectedFile: string;
};

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    template: {
      type: Object,
      required: true,
    },
    reset: {
      type: String,
      required: true,
    },
    resetSelectedFile: {
      type: String,
      required: true,
    },
  },
  emits: ["fileSelected", "selected"],
  data(): Store {
    return {
      selected: false,
      selectedFile: "",
      showFiles: false,
    };
  },
  computed: {
    kindDot(): string {
      const kind = this.name.toLowerCase();
      if (/(deploy|stateful|daemon|replica|pod)/.test(kind)) {
        return "bg-emerald-400";
      }
      if (/(service|ingress|endpoint|gateway)/.test(kind)) {
        return "bg-sky-400";
      }
      if (/(config|secret|volume|claim)/.test(kind)) {
        return "bg-violet-400";
      }
      if (/(job|cron)/.test(kind)) {
        return "bg-amber-400";
      }
      if (/(role|policy|rbac|account)/.test(kind)) {
        return "bg-rose-400";
      }
      return "bg-mist";
    },
  },
  watch: {
    reset: function () {
      this.selected = false;
    },
    resetSelectedFile: function () {
      this.selectedFile = "";
    },
  },
  methods: {
    onSelected() {
      this.$emit("selected", this.name);
      this.selected = !this.selected;
      this.showFiles = !this.showFiles;
    },
    onFileSelected(file: string) {
      this.$emit("fileSelected", file);
      this.selectedFile = file;
    },
  },
};
</script>
