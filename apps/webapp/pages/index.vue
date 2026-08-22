<template>
  <div class="flex h-screen min-h-0 flex-col overflow-hidden bg-ink text-foam">
    <Loader v-if="!data.templated && !fetchDataError" />
    <InstructionsHelper v-if="fetchDataError" />

    <Error
      v-if="helmError"
      :error="helmError"
      @close="helmError = null"
    />

    <modal v-if="sharingProcess" @close="closeSharingModal">
      <template v-if="sharedUrl" #body>
        <div class="flex w-full flex-col px-8 py-10">
          <p class="font-display text-3xl text-foam">Share this chart</p>
          <p class="mt-2 text-[13px] text-mist">
            The payload is encrypted before it leaves the browser. This link is
            the only way to open it.
          </p>

          <textarea
            v-model="sharedUrl"
            readonly
            class="mt-8 min-h-28 w-full resize-none rounded-lg bg-ink p-3 font-mono text-[13px] text-signal ring-1 ring-line outline-none"
          />

          <button
            class="mt-6 self-start rounded-md bg-signal px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-signal/90"
            type="button"
            @click="copyText(sharedUrl)"
          >
            {{ copyButtonText }}
          </button>
        </div>
      </template>
    </modal>

    <transition name="fade">
      <div
        v-if="showHistoryMenu"
        class="absolute inset-0 z-30 bg-ink/50"
        @click="showHistoryMenu = false"
      />
    </transition>
    <transition name="drawer">
      <HistoryMenu
        v-if="showHistoryMenu"
        @close="showHistoryMenu = false"
      />
    </transition>

    <template v-if="!fetchDataError && data.templated">
      <header
        class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-harbor/90 px-4"
      >
        <div class="flex min-w-0 items-center gap-3">
          <HelmMark mark-class="h-7 w-7 text-signal" />
          <div class="min-w-0">
            <div class="flex items-baseline gap-2">
              <h1 class="truncate font-display text-[22px] leading-none text-foam">
                {{ chartMeta.name || "helm-viewer" }}
              </h1>
              <span
                v-if="chartMeta.version"
                class="font-mono text-[11px] text-brass"
              >
                {{ chartMeta.version }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-[11px] text-mist">
              {{ chartMeta.description || "Rendered Helm templates" }}
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <button
            class="rounded-md px-3 py-1.5 text-[13px] text-foam ring-1 ring-line transition-colors hover:bg-dock"
            type="button"
            @click="shared"
          >
            Share
          </button>
          <button
            class="rounded-md px-3 py-1.5 text-[13px] text-foam ring-1 ring-line transition-colors hover:bg-dock"
            type="button"
            @click="showHistoryMenu = true"
          >
            History
          </button>
        </div>
      </header>

      <div class="flex min-h-0 flex-1">
        <Sidebar
          :active="currentEditorValue"
          :data="data"
          :fetch-data-error="fetchDataError"
          @display-template-file="
            ({ file, k8sResourceName }) =>
              displayTemplatedFile(k8sResourceName, file)
          "
          @display-source-file="
            ({ filename, isTemplate }) =>
              displaySourceFile(filename, isTemplate)
          "
        />

        <section class="flex min-h-0 min-w-0 flex-1 flex-col bg-editor">
          <div
            class="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-line px-4"
          >
            <p class="truncate font-mono text-[12px] text-mist">
              {{ currentPath }}
            </p>
            <span
              class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-mist"
            >
              {{ fileLanguage }}
            </span>
          </div>

          <div class="relative min-h-0 flex-1">
            <MonacoEditor
              v-model="editorValue"
              :options="editorOptions"
              class="absolute inset-0"
              :lang="fileLanguage"
            />
          </div>
        </section>
      </div>

      <footer
        class="flex h-8 shrink-0 items-center justify-between border-t border-line bg-harbor px-4 font-mono text-[11px] text-mist"
      >
        <span>{{ resourceCount }} rendered resources</span>
        <span class="flex items-center gap-2">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="live ? 'bg-signal' : 'bg-mist'"
          />
          {{ live ? "Live watch" : "Snapshot" }}
        </span>
      </footer>
    </template>

    <NuxtNotifications position="bottom left" :speed="500" />
  </div>
</template>

<script lang="ts">
import { useNotification } from "@kyvg/vue3-notification";

import levenshtein from "js-levenshtein";
import yaml from "js-yaml";
import { nanoid } from "nanoid";

import { encrypt } from "../functions/encryption";
import { loadChart } from "../functions/load-chart";
import { readRemoteChart } from "../functions/read-remote-chart";
import { getTheme, type Theme,THEME_EVENT } from "../functions/theme";

type ChartSources = Record<string, string | Record<string, string>> & {
  templates?: Record<string, string>;
};

type ChartData = {
  name: string;
  sources: ChartSources | undefined;
  templated: Record<string, Record<string, string>> | undefined;
};

export type Store = {
  helmError: string | null;
  editorValue: string;
  showHistoryMenu: boolean;
  currentEditorValue:
    | { type: "Template"; template: string; filename: string }
    | { type: "Source"; filename: string; isTemplate: boolean }
    | undefined;
  sharingProcess: boolean;
  sharedUrl: string;
  copyButtonText: string;
  live: boolean;
  data: ChartData;
  fetchDataError: boolean;
  fileLanguage: "yaml" | "markdown";
  theme: Theme;
};

export default {
  data(): Store {
    return {
      showHistoryMenu: false,
      helmError: null,
      editorValue: "",
      currentEditorValue: undefined,
      sharedUrl: "",
      sharingProcess: false,
      copyButtonText: "Copy link",
      live: false,
      fileLanguage: "yaml",
      data: {
        templated: undefined,
        sources: undefined,
        name: "",
      },
      fetchDataError: false,
      theme: "light",
    };
  },
  computed: {
    chartMeta() {
      try {
        const parsed = yaml.load(
          (this.data.sources as { ["Chart.yaml"]?: string } | undefined)?.[
            "Chart.yaml"
          ] ?? "",
        ) as { version?: string; name?: string; description?: string };

        return {
          name: parsed?.name ?? this.data.name,
          version: parsed?.version ?? "",
          description: parsed?.description ?? "",
        };
      } catch {
        return { name: this.data.name, version: "", description: "" };
      }
    },
    currentPath() {
      if (!this.currentEditorValue) {
        return "Select a file";
      }

      if (this.currentEditorValue.type === "Template") {
        return `${this.currentEditorValue.template} / ${this.currentEditorValue.filename}`;
      }

      return this.currentEditorValue.isTemplate
        ? `templates / ${this.currentEditorValue.filename}`
        : this.currentEditorValue.filename;
    },
    resourceCount() {
      if (!this.data.templated) {
        return 0;
      }

      return Object.values(this.data.templated).reduce((total, files) => {
        return total + Object.keys(files as object).length;
      }, 0);
    },
    editorOptions() {
      return {
        theme: this.theme === "dark" ? "vs-dark" : "vs",
        fontSize: 14,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: "on" as const,
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        lineHeight: 22,
        renderLineHighlight: "line" as const,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: { verticalScrollbarSize: 10 },
      };
    },
  },
  async mounted() {
    this.theme = getTheme();
    window.addEventListener("keydown", this.onKeydown);
    window.addEventListener(THEME_EVENT, this.onThemeChange);

    const data = new URL(window.location.href);
    const id = data.searchParams.get("id")!;
    const isOnline =
      data.searchParams.get("online") !== null
        ? data.searchParams.get("online") === "true"
        : data.searchParams.get("o") === "t";
    const encryptionKey =
      data.searchParams.get("k") ??
      data.searchParams.get("encryptionKey") ??
      "";

    if (isOnline) {
      this.data = (await readRemoteChart(
        id,
        encryptionKey,
        this.$config.public.remoteURL,
      )) as ChartData;
      window.location.assign(`/?id=${id}`);
    } else {
      try {
        const loaded = (await loadChart(id)) as ChartData;
        this.data = loaded;
      } catch (err) {
        // When the localstorage is full
        // @ts-expect-error helm-viewer stores a DOMException-like error
        if (err.message === "The quota has been exceeded.") {
          localStorage.clear();
          try {
            const loaded = (await loadChart(id)) as ChartData;
            this.data = loaded;
          } catch {
            this.fetchDataError = true;
          }
        } else {
          this.fetchDataError = true;
        }
      }
    }

    // If there is an error we won't continue the process
    if (this.fetchDataError) {
      return;
    }

    this.displaySourceFile("Chart.yaml", false);
    document.title = this.chartMeta.name
      ? `${this.chartMeta.name} · helm-viewer`
      : "helm-viewer";
    const notification = useNotification();

    setTimeout(() => {
      const socket = new WebSocket("ws://localhost:12096");
      socket.addEventListener("open", () => {
        this.live = true;
      });
      socket.addEventListener("close", () => {
        this.live = false;
      });
      socket.addEventListener("error", () => {
        this.live = false;
      });
      socket.addEventListener("message", event => {
        const { filePath, chartContentUpdated, error } = JSON.parse(event.data);

        if (error) {
          console.log(error);
          this.helmError = error;
          return;
        }

        this.helmError = null;

        notification.notify({
          title: "Chart updated",
          text: filePath.split("/").at(-1),
          type: "info",
        });

        this.data = { ...(chartContentUpdated as ChartData) };
        if (this.currentEditorValue?.type === "Template") {
          let min = 1000;
          let goodKey = "";
          const keys = Object.keys(
            this.data.templated?.[this.currentEditorValue.template] ?? {},
          );

          for (const key of keys) {
            const distance = levenshtein(this.currentEditorValue.filename, key);
            console.log(distance);
            if (distance < min) {
              goodKey = key;
              min = distance;
            }
          }

          this.displayTemplatedFile(this.currentEditorValue.template, goodKey);
        } else if (this.currentEditorValue?.type === "Source") {
          this.displaySourceFile(
            this.currentEditorValue.filename,
            this.currentEditorValue.isTemplate,
          );
        }
      });
    }, 1000);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
    window.removeEventListener(THEME_EVENT, this.onThemeChange);
  },
  methods: {
    onThemeChange(event: Event) {
      this.theme = (event as CustomEvent<Theme>).detail;
      (
        window as Window & {
          monaco?: { editor?: { setTheme: (theme: string) => void } };
        }
      ).monaco?.editor?.setTheme(this.theme === "dark" ? "vs-dark" : "vs");
    },
    onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        this.showHistoryMenu = false;
        if (this.sharingProcess) {
          this.closeSharingModal();
        }
        this.helmError = null;
      }
    },
    displayTemplatedFile(template: string, filename: string) {
      this.currentEditorValue = {
        type: "Template",
        template,
        filename,
      };

      this.editorValue = (
        this.data.templated?.[this.currentEditorValue.template]?.[
          this.currentEditorValue.filename
        ] ?? ""
      ).replace("\n", "");
      this.fileLanguage = "yaml";
    },
    displaySourceFile(filename: string, isTemplate?: boolean) {
      this.currentEditorValue = {
        type: "Source",
        filename,
        isTemplate: isTemplate ?? false,
      };

      if (isTemplate) {
        this.editorValue = this.data.sources?.templates?.[filename] ?? "";
      } else {
        const source = this.data.sources?.[filename];
        this.editorValue = typeof source === "string" ? source : "";
      }

      this.fileLanguage = filename.endsWith(".md") ? "markdown" : "yaml";
    },
    async shared() {
      this.sharingProcess = true;
      this.sharedUrl = "";
      this.copyButtonText = "Copy link";
      const encryptionKey = nanoid();
      const { version, name } = yaml.load(
        (this.data.sources?.["Chart.yaml"] as string) ?? "",
      ) as {
        version: string;
        name: string;
      };
      const payload = {
        chartVersion: version,
        chartName: name,
        content: encrypt(JSON.stringify(this.data), encryptionKey),
      };

      await $fetch("/api/chart-upload", {
        method: "POST",
        body: JSON.stringify({
          chartId: new URL(window.location.toString()).searchParams.get("id"),
          content: JSON.stringify(payload),
        }),
      });

      const id = new URL(window.location.toString()).searchParams.get("id");
      this.sharedUrl = `${this.$config.public.remoteURL}?id=${id}&k=${encryptionKey}&o=t`;
    },
    closeSharingModal() {
      this.copyButtonText = "Copy link";
      this.sharingProcess = false;
    },
    async copyText(mytext: string) {
      try {
        await navigator.clipboard.writeText(mytext);
        this.copyButtonText = "Copied";
      } catch {
        alert("Cannot copy");
      }
    },
  },
};
</script>
