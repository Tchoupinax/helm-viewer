<template>
  <div id="app" class="flex flex-col h-12">
    <Loader v-if="!data.templated" />
    <InstructionsHelper v-if="fetchDataError" />

    {{ helmError }}
    <Error v-if="helmError" :error="helmError" />

    <modal
      v-if="sharingProcess"
      @close="closeSharingModal"
    >
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
            class="bg-blue-500 mt-16 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
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
      <div class="w-3/12 bg-blue-50 h-screen overflow-scroll">
        <div class="p-2">
          <h1 class="italic text-3xl font-thin ml-4 mb-4 underline">Computed files</h1>

          <div
            v-if="data.templated"
            v-for="template of Object.keys(data.templated)"
            class="mb-2"
          >
            <p class="text-xl font-thin">
              ➡ {{ template }}
            </p>

            <div
              class="ml-6 mt-2 flex cursor-pointer hover:bg-slate-300 pl-2"
              v-for="file of Object.keys(data.templated[template])"
              @click="displayTemplatedFile(template, file)"
            >
              🟢 {{ file }}
            </div>
          </div>
        </div>

        <div v-if="data.sources" class="bg-green-100 border-t-2 border-black">
          <h1 class="italic text-3xl font-thin mt-2 ml-4 mb-4 underline">Sources</h1>
          <div class="mb-1" v-for="file of Object.keys(data.sources).filter(n => n !== 'templates')">
            <p
              class="ml-6 font-thin hover:bg-slate-300 pl-2 cursor-pointer"
              @click="displaySourceFile(file)"
            >
              {{ file }}
            </p>
          </div>
          
          <p v-if="data.sources['templates']" class="font-thin ml-2">
            ➡ templates
          </p>

          <div
            v-if="data.sources['templates']"
            v-for="file of Object.keys(data.sources['templates'])"
            class="mb-1 hover:bg-slate-300 pl-2 cursor-pointer"
          >
            <p
              class="ml-8 font-thin"
              @click="displaySourceFile(file, true)"
            >
              🟢 {{ file }}
            </p>
          </div>
        </div>
      </div>

      <MonacoEditor 
        :options="{ theme: 'vs-dark', fontSize: 16, readOnly: true, automaticLayout: true }"
        class="w-full h-full text-xl"
        v-model="editorValue"
        lang="yaml"
      />

      <notifications />
    </div>
  </div>
</template>

<script lang="ts">
import { loadChart } from '../functions/load-chart'
import { readRemoteChart } from '../functions/read-remote-chart';
import { encrypt } from '../functions/encryption'
import yaml from 'js-yaml'
import { nanoid } from 'nanoid'
import { useNotification } from "@kyvg/vue3-notification";
import Error from '../components/global/error.vue'

export type Store = {
  helmError: string | null;
  editorValue: string;
  showHistoryMenu: boolean;
  currentEditorValue: { type: 'Template', template: string, filename: string } | { type: "Source"; filename: string, isTemplate: boolean } | undefined;
  sharingProcess: boolean;
  sharedUrl: string;
  copyButtonText: string;
  data: {
    templated: object | undefined;
    sources: object | undefined;
  }
  fetchDataError: boolean;
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
      data: {
        templated: undefined,
        sources: undefined,
      },
      fetchDataError: false,
    }
  },
  async mounted() {
    const data = new URL(window.location.href);
    const id = data.searchParams.get('id')!
    const isOnline = data.searchParams.get('online') !== null ? 
      data.searchParams.get('online') === "true" : 
      data.searchParams.get('o') === "t";
    const encryptionKey = data.searchParams.get('k') ?? data.searchParams.get('encryptionKey') ?? ""

    if (isOnline) {
      this.data = await readRemoteChart(id, encryptionKey, this.$config.public.remoteURL)
      window.location.assign(`/?id=${id}`)
    } else {
      try {
        const data = await loadChart(id)
        this.data = data;
      } catch (err) {
        this.fetchDataError = true
      }
    }

    // If there is an error we won't continue the process
    if (this.fetchDataError) {
      return
    }

    this.displaySourceFile("Chart.yaml", false);
    const notification = useNotification()

    setTimeout(() => {
      const socket = new WebSocket('ws://localhost:12096');
      socket.addEventListener("message", (event) => {
        const { filePath, chartContentUpdated, error } = JSON.parse(event.data)

        if (error) {
          console.log(error)
          this.helmError = error
          return
        }

        this.helmError = null;

        notification.notify({
          title: "Chart updated",
          text: filePath.split("/").at(-1),
          type: "info"
        })

        this.data = { ...chartContentUpdated }
        if (this.currentEditorValue?.type === "Template") {
          this.displayTemplatedFile(this.currentEditorValue.template, this.currentEditorValue.filename)
        } else if (this.currentEditorValue?.type === "Source") {
          this.displaySourceFile(this.currentEditorValue.filename, this.currentEditorValue.isTemplate)
        }
      });
    }, 1000)
  },
  methods: {
    displayTemplatedFile(template: string, filename: string) {
      this.currentEditorValue = {
        type: "Template",
        template,
        filename,
      };

      this.editorValue = this.data["templated"][this.currentEditorValue.template][this.currentEditorValue.filename].replace("\n", "")
    },
    displaySourceFile(filename: string, isTemplate: boolean) {
      this.currentEditorValue = {
        type: "Source",
        filename,
        isTemplate,
      };

      if (isTemplate) {
        this.editorValue = this.data["sources"]["templates"][filename]
      } else {
        this.editorValue = this.data["sources"][filename]
      }
    },
    async shared() {
      this.sharingProcess = true;
      const encryptionKey = nanoid()
      const { version, name } = yaml.load(this.data.sources['Chart.yaml']) as { version: string, name: string };
      const payload = {
        chartVersion: version,
        chartName: name,
        content: encrypt(JSON.stringify(this.data), encryptionKey)
      }

      await $fetch('/api/chart-upload', {
        method: "POST",
        body: JSON.stringify({
          chartId: new URL(window.location).searchParams.get('id'),
          content: JSON.stringify(payload),
        })
      })

      const id = new URL(window.location).searchParams.get('id');
      this.sharedUrl = `${this.$config.public.remoteURL}?id=${id}&k=${encryptionKey}&o=t`
    },
    closeSharingModal() {
      this.copyButtonText = 'Copy';
      this.sharingProcess = false;
    },
    async copyText (mytext: string) {
      try {
        await navigator.clipboard.writeText(mytext);
        this.copyButtonText = "Copied!";
      } catch($e) {
        alert('Cannot copy');
      }
    }
  }
};
</script>