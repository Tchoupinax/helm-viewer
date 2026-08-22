<template>
  <aside
    class="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-line bg-harbor/80 xl:w-80"
  >
    <div class="border-b border-line px-3 py-3">
      <label class="sr-only" for="chart-search">Search files</label>
      <div
        class="flex items-center gap-2 rounded-md bg-ink px-2.5 ring-1 ring-line focus-within:ring-signal/50"
      >
        <svg
          class="h-3.5 w-3.5 shrink-0 text-mist"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3 3" stroke-linecap="round" />
        </svg>
        <input
          id="chart-search"
          v-model="query"
          class="h-8 w-full bg-transparent text-[13px] text-foam outline-none placeholder:text-mist/70"
          placeholder="Filter resources and sources"
          type="search"
        />
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-2 py-3">
      <p
        class="mb-2 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mist"
      >
        Templated
      </p>

      <div v-if="data.templated">
        <SidebarTemplate
          v-for="(template, index) of filteredTemplateKeys"
          :key="`${template}-${index}`"
          :name="template"
          :reset="resetTemplate"
          :reset-selected-file="resetSelectedFile"
          :template="visibleTemplateFiles(template)"
          @file-selected="(file) => onFileSelected(template, file)"
        />
        <p
          v-if="filteredTemplateKeys.length === 0"
          class="px-2 py-3 text-[12px] text-mist"
        >
          No rendered resources match.
        </p>
      </div>

      <div v-if="data.sources" class="mt-5 border-t border-line pt-4">
        <p
          class="mb-2 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mist"
        >
          Sources
        </p>

        <button
          v-for="filename of filteredSourceFiles"
          :key="filename"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors"
          :class="
            isActiveSource(filename, false)
              ? 'bg-signal/10 text-signal'
              : 'text-mist hover:bg-dock hover:text-foam'
          "
          type="button"
          @click="onSourceSelected(filename, false)"
        >
          <span class="font-mono text-[11px] text-signal/70">·</span>
          <span class="truncate font-mono text-[12px]">{{ filename }}</span>
        </button>

        <div v-if="hasTemplatesFolder" class="mt-2">
          <p class="px-2 pb-1 font-mono text-[11px] text-mist">templates/</p>
          <button
            v-for="filename of filteredSourceTemplates"
            :key="`tpl-${filename}`"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 pl-5 text-left text-[13px] transition-colors"
            :class="
              isActiveSource(filename, true)
                ? 'bg-signal/10 text-signal'
                : 'text-mist hover:bg-dock hover:text-foam'
            "
            type="button"
            @click="onSourceSelected(filename, true)"
          >
            <span class="truncate font-mono text-[12px]">{{ filename }}</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    fetchDataError: {
      type: Boolean,
      required: true,
    },
    active: {
      type: Object,
      default: undefined,
    },
  },
  emits: ["displayTemplateFile", "displaySourceFile"],
  data() {
    return {
      query: "",
      resetTemplate: new Date().toISOString(),
      resetSelectedFile: new Date().toISOString(),
    };
  },
  computed: {
    normalizedQuery(): string {
      return this.query.trim().toLowerCase();
    },
    filteredTemplateKeys(): string[] {
      if (!this.data.templated) {
        return [];
      }

      return Object.keys(this.data.templated)
        .filter(template => {
          if (!this.normalizedQuery) {
            return true;
          }

          if (template.toLowerCase().includes(this.normalizedQuery)) {
            return true;
          }

          return Object.keys(this.data.templated[template]).some(file =>
            file.toLowerCase().includes(this.normalizedQuery),
          );
        })
        .sort((a, b) => a.localeCompare(b));
    },
    filteredSourceFiles(): string[] {
      if (!this.data.sources) {
        return [];
      }

      return Object.keys(this.data.sources)
        .filter(name => name !== "templates")
        .filter(name =>
          this.normalizedQuery
            ? name.toLowerCase().includes(this.normalizedQuery)
            : true,
        );
    },
    hasTemplatesFolder(): boolean {
      return Boolean(this.data.sources?.templates);
    },
    filteredSourceTemplates(): string[] {
      if (!this.data.sources?.templates) {
        return [];
      }

      return Object.keys(this.data.sources.templates).filter(name =>
        this.normalizedQuery
          ? name.toLowerCase().includes(this.normalizedQuery)
          : true,
      );
    },
  },
  methods: {
    isActiveSource(filename: string, isTemplate: boolean) {
      return (
        this.active?.type === "Source" &&
        this.active.filename === filename &&
        this.active.isTemplate === isTemplate
      );
    },
    visibleTemplateFiles(template: string) {
      const files = this.data.templated[template];
      if (!this.normalizedQuery) {
        return files;
      }

      if (template.toLowerCase().includes(this.normalizedQuery)) {
        return files;
      }

      return Object.fromEntries(
        Object.entries(files).filter(([file]) =>
          file.toLowerCase().includes(this.normalizedQuery),
        ),
      );
    },
    onSourceSelected(filename: string, isTemplate = false) {
      this.resetSelectedFile = new Date().toISOString();
      this.$emit("displaySourceFile", { filename, isTemplate });
    },
    onFileSelected(k8sResourceName: string, file: string) {
      this.resetSelectedFile = new Date().toISOString();
      this.$emit("displayTemplateFile", { file, k8sResourceName });
    },
  },
};
</script>
