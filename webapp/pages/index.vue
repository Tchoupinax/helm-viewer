<template>
  <div id="app" class="flex flex-col h-12">
    <Loader v-if="!data.templated" />
    <InstructionsHelper v-if="fetchDataError" />

    <Error v-if="helmError" :error="helmError" />

    <modal v-if="sharingProcess" @close="closeSharingModal">
      <template #body v-if="sharedUrl">
        <div class="flex flex-col w-full h-full items-center">
          <h1 class="text-4xl mt-16 underline">Sharing URL</h1>

          <div class="flex items-center justify-center mt-28 w-2/3">
            <textarea
              v-model="sharedUrl"
              class="rounded-xl h-40 text-gray-600 p-2 bg-gray-100 border-black border text-2xl w-full"
            />
          </div>

          <button
            @click="copyText(sharedUrl)"
            class="mt-16 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
          >
            {{ copyButtonText }}
          </button>
        </div>
      </template>
    </modal>

    <HistoryMenu
      v-if="showHistoryMenu"
      @close="showHistoryMenu = false"
      class="absolute h-full bg-white top-0 right-0 w-96 z-40"
    />

    <button
      v-if="!showHistoryMenu && !fetchDataError && data.templated"
      @click="showHistoryMenu = !showHistoryMenu"
      class="absolute bg-purple-300 p-2 text-purple-700 bottom-0 right-0 z-50 mr-4 mb-4 tracking-widest text-xl rounded-xl"
    >
      History
    </button>

    <button
      v-if="!showHistoryMenu && !fetchDataError && data.templated"
      @click="shared"
      class="cursor-pointer absolute bg-purple-300 p-2 text-purple-700 bottom-0 right-0 z-50 mr-32 mb-4 tracking-widest text-xl rounded-xl"
    >
      Share
    </button>

    <div class="flex" v-if="!fetchDataError && data.templated">
      <Sidebar
        :data="data"
        :fetchDataError="fetchDataError"
        @displayTemplateFile="
          ({ file, k8sResourceName }) =>
            displayTemplatedFile(k8sResourceName, file)
        "
        @displaySourceFile="({ filename }) => displaySourceFile(filename)"
      />

      <MonacoEditor
        :options="{
          theme: 'vs-dark',
          fontSize: 16,
          readOnly: true,
          automaticLayout: true,
        }"
        class="w-full h-full text-xl"
        v-model="editorValue"
        :lang="fileLanguage"
      />

      <NuxtNotifications position="bottom left" :speed="500" />
    </div>
  </div>
</template>

<script lang="ts">
import { loadChart } from "../functions/load-chart";
import { readRemoteChart } from "../functions/read-remote-chart";
import { encrypt } from "../functions/encryption";
import yaml from "js-yaml";
import { nanoid } from "nanoid";
import { useNotification } from "@kyvg/vue3-notification";
import Error from "../components/global/error.vue";
import levenshtein from "js-levenshtein";
import { useAppConfig } from "#app";

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
  data: {
    templated: object | undefined;
    sources: object | undefined;
    name: string;
  };
  fetchDataError: boolean;
  fileLanguage: "yaml" | "markdown";
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
      copyButtonText: "Copy",
      fileLanguage: "yaml",
      data: {
        templated: undefined,
        sources: undefined,
        name: "",
      },
      fetchDataError: false,
    };
  },
  async mounted() {
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
      this.data = await readRemoteChart(
        id,
        encryptionKey,
        this.$config.public.remoteURL
      );
      window.location.assign(`/?id=${id}`);
    } else {
      try {
        const data = await loadChart(id);
        this.data = data;
      } catch (err) {
        // When the localstorage is full
        // @ts-ignore
        if (err.message === "The quota has been exceeded.") {
          localStorage.clear();
          try {
            const data = await loadChart(id);
            this.data = data;
          } catch (err) {
            this.fetchDataError = true;
          }
        }
        this.fetchDataError = true;
      }
    }

    // If there is an error we won't continue the process
    if (this.fetchDataError) {
      return;
    }

    this.displaySourceFile("Chart.yaml", false);
    const notification = useNotification();

    setTimeout(() => {
      const socket = new WebSocket("ws://localhost:12096");
      socket.addEventListener("message", (event) => {
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

        this.data = { ...chartContentUpdated };
        if (this.currentEditorValue?.type === "Template") {
          let min = 1000;
          let goodKey = "";
          const keys = Object.keys(
            this.data["templated"][this.currentEditorValue.template]
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
          this.displaySourceFile(goodKey, this.currentEditorValue.isTemplate);
        }
      });
    }, 1000);
  },
  methods: {
    displayTemplatedFile(template: string, filename: string) {
      this.currentEditorValue = {
        type: "Template",
        template,
        filename,
      };

      this.editorValue = this.data["templated"][
        this.currentEditorValue.template
      ][this.currentEditorValue.filename].replace("\n", "");
      this.fileLanguage = "yaml";
    },
    displaySourceFile(filename: string, isTemplate?: boolean) {
      this.currentEditorValue = {
        type: "Source",
        filename,
        isTemplate: isTemplate ?? false,
      };

      if (isTemplate) {
        this.editorValue = this.data["sources"]["templates"][filename];
      } else {
        this.editorValue = this.data["sources"][filename as string];
      }

      if (filename.endsWith(".md")) {
        this.fileLanguage = "markdown";
      }
    },
    async shared() {
      this.sharingProcess = true;
      const encryptionKey = nanoid();
      const { version, name } = yaml.load(this.data.sources["Chart.yaml"]) as {
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
      this.copyButtonText = "Copy";
      this.sharingProcess = false;
    },
    async copyText(mytext: string) {
      try {
        await navigator.clipboard.writeText(mytext);
        this.copyButtonText = "Copied!";
      } catch ($e) {
        alert("Cannot copy");
      }
    },
  },
};
</script>
