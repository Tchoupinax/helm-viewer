<template>
  <div id="app" class="flex flex-col h-12">
    <Loader v-if="!data.templated" />

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
              class="ml-6 mt-2 flex"
              v-for="file of Object.keys(data.templated[template])"
              @click="displayTemplatedFile(template, file)"
            >
              🟢 {{ file }}
            </div>
          </div>
        </div>

        <div v-if="data.sources" class="bg-green-100 border-t-2 border-black">
          <h1 class="italic text-3xl font-thin ml-4 mb-4 underline">Sources</h1>
          <div class="mb-1" v-for="file of Object.keys(data.sources).filter(n => n !== 'templates')">
            <p
              class="text-xl ml-8 font-thin"
              @click="displaySourceFile(file)"
            >
              {{ file }}
            </p>
          </div>
          
          <p v-if="data.sources['templates']" class="text-xl font-thin ml-2">
            ➡ templates
          </p>

          <div
            v-if="data.sources['templates']"
            v-for="file of Object.keys(data.sources['templates'])"
            class="mb-1 ml-6"
          >
            <p
              class="text-xl ml-8 font-thin"
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
export type Store = {
  editorValue: string,
  data: {
    templated: object | undefined,
    sources: object | undefined,
  }
};

export default {
  data(): Store {
    return {
      editorValue: "",
      data: {
        templated: undefined,
        sources: undefined,
      }
    }
  },
  async mounted() {
    const data = new URL(window.location);
    const id = data.searchParams.get('id')
    const key = `helm-viewer-${id}`

    if (!localStorage.getItem(key)) {
      await fetch("http://localhost:12094")
        .then(res => res.json())
        .then(e => {
          this.data = JSON.parse(e);
          localStorage.setItem(key, e)
        })
    } else {
      this.data = JSON.parse(localStorage.getItem(key)!)
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
    }
  }
};
</script>