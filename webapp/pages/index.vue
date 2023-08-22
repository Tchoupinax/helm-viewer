<template>
  <div id="app" class="flex flex-col h-12">
    <Loader v-if="!data.templated" />

    <div class="p-2">
      search bar
    </div>

    <div class="flex">
      <div 
        class="w-2/5 xl:w-1/5 bg-blue-50 h-screen overflow-scroll"
      >
        <div class="p-2">
          <h1 class="italic text-2xl xl:text-4xl font-thin ml-4 mb-8">>> Computed files</h1>

          <div
            v-if="data.templated"
            v-for="template of Object.keys(data.templated)"
            class="mb-2"
          >
            <p class="text-xl xl:text-3xl font-thin">
              {{ template }}
            </p>

            <div
              class="ml-6 mt-2"
              v-for="file of Object.keys(data.templated[template])"
              @click="displayTemplatedFile(template, file)"
            >
              {{ file }}
            </div>
          </div>
        </div>

        <div
          v-if="data.sources"
          class="bg-green-100"
        >
          <h1 class="italic text-4xl font-thin ml-4 mb-8">>> Sources</h1>
          <div class="mb-1" v-for="file of Object.keys(data.sources).filter(n => n !== 'templates')">
            <p
              class="text-xl ml-8 font-thin"
              @click="displaySourceFile(file)"
            >
              {{ file }}
            </p>
          </div>
          
          <p v-if="data.sources['templates']" class="text-xl ml-8 font-thin">templates</p>

          <div
            v-if="data.sources['templates']"
            v-for="file of Object.keys(data.sources['templates'])"
            class="mb-1 ml-6"
          >
            <p
              class="text-xl ml-8 font-thin"
              @click="displaySourceFile(file, true)"
            >
              {{ file }}
            </p>
          </div>
        </div>
      </div>

      <div id="container" class="w-4/5">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export type Store = {
  data: {
    templated: object | undefined,
    sources: object | undefined,
  }
};

export default {
  data(): Store {
    return {
      data: {
        templated: undefined,
        sources: undefined,
      }
    }
  },
  mounted() {
    fetch("http://localhost:12094")
    .then(res => res.json())
    .then(e => {
      this.data = JSON.parse(e)
      console.log(this.data)
    })
  },
};
</script>