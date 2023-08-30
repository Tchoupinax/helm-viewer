<template>
  <div id="app" class="flex flex-col h-12">
    <Loader v-if="!data.templated" />

    <modal v-if="sharedUrl" @close="sharedUrl=''">
      <template #body>
        <div class="flex items-center justify-center w-full">
          <input v-model="sharedUrl" class="border-black border p-1 text-xl w-full">
        </div>
      </template>
    </modal>

    <HistoryMenu v-if="showHistoryMenu" class="absolute h-full bg-white top-0 right-0 w-96 z-40" />

    <button @click="showHistoryMenu = !showHistoryMenu" class="absolute bg-purple-500 p-2 text-white bottom-0 right-0 z-50 mr-6 mb-4 tracking-widest text-xl rounded-xl">
      History
    </button>

    <button 
      @click="shared"
      class="absolute bg-blue-400 p-2 text-white bottom-0 right-0 z-50 mr-36 mb-4 tracking-widest text-xl rounded-xl"
    >
      Shared
    </button>

    <div class="flex">
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
        :options="{ theme: 'vs-dark', fontSize: 16, readOnly: true }"
        class="w-full h-full text-xl"
        v-model="editorValue"
        lang="yaml"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { loadChart } from '../functions/load-chart'
import { readRemoteChart } from '../functions/read-remote-chart';
import { readSharedChart } from '../functions/read-shared-chart'

export type Store = {
  editorValue: string,
  showHistoryMenu: boolean;
  sharedUrl: string;
  data: {
    templated: object | undefined;
    sources: object | undefined;
  }
};

export default {
  data(): Store {
    return {
      showHistoryMenu: false,
      editorValue: "",
      sharedUrl: "",
      data: {
        templated: undefined,
        sources: undefined,
      }
    }
  },
  async mounted() {
    const data = new URL(window.location);
    const id = data.searchParams.get('id')!
    const shared = data.searchParams.get('shared') === "true"
    const isOnline = data.searchParams.get('online') === "true";
    const encryptionKey = data.searchParams.get('encryptionKey') ?? ""

    if (isOnline) {
      this.data = await readRemoteChart(id, encryptionKey)
      window.location = `/?id=${id}`
    } else if (shared) {
      this.data = await readSharedChart(id, encryptionKey);
      window.location = `/?id=${id}`
    } else {
      this.data = await loadChart(id)
    }

    this.displaySourceFile("Chart.yaml", false);
  },
  methods: {
    displayTemplatedFile(template: string, filename: string) {
      this.editorValue = this.data["templated"][template][filename].replace("\n", "")
    },
    displaySourceFile(filename: string, isTemplate: boolean) {
      if (isTemplate) {
        this.editorValue = this.data["sources"]["templates"][filename]
      } else {
        this.editorValue = this.data["sources"][filename]
      }
    },
    async shared() {
      const data = await $fetch(`/api/shared/upload?id=${new URL(window.location).searchParams.get('id')}`, {
        method: "POST",
        body: {
          content: this.data,
        }
      })

      this.sharedUrl = `http://localhost:3000?id=${new URL(window.location).searchParams.get('id')}&&encryptionKey=${data.encryptionKey}&&shared=true`
    }
  }
};
</script>