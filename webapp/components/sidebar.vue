<template>
  <div class="w-1/3 xl:w-3/12 h-screen overflow-scroll">
    <h1 class="text-3xl text-center mb-4 mt-2">
      {{ data.name }}
    </h1>

    <div class="p-2">
      <div
        v-if="data.templated"
        v-for="(template, index) of Object.keys(data.templated).sort((a, b) =>
          a.length > b.length ? 1 : -1
        )"
        class="mb-2"
      >
        <SidebarTemplate
          :key="index"
          :name="template"
          :reset="resetTemplate"
          :resetSelectedFile="resetSelectedFile"
          :template="data.templated[template]"
          @file-selected="(file) => onFileSelected(template, file)"
        />
      </div>
    </div>

    <div v-if="data.sources" class="border-t-2 border-black">
      <h2 class="italic text-3xl font-thin mt-2 ml-4 mb-4 underline">
        Sources
      </h2>
      <div
        class="mb-1"
        v-for="filename of Object.keys(data.sources).filter(
          (n) => n !== 'templates'
        )"
      >
        <p
          class="ml-6 font-thin hover:bg-slate-300 pl-2 cursor-pointer"
          @click="onSourceSelected(filename)"
        >
          {{ filename }}
        </p>
      </div>

      <p v-if="data.sources['templates']" class="font-thin ml-2">
        ➡ templates
      </p>

      <div
        v-if="data.sources['templates']"
        v-for="filename of Object.keys(data.sources['templates'])"
        class="mb-1 hover:bg-slate-300 pl-2 cursor-pointer"
      >
        <p class="ml-8 font-thin" @click="onSourceSelected(filename)">
          {{ filename }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  emits: ["displayTemplateFile", "displaySourceFile"],
  props: {
    data: {
      type: Object,
      required: true,
    },
    fetchDataError: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      resetTemplate: new Date().toISOString(),
      resetSelectedFile: new Date().toISOString(),
    };
  },
  methods: {
    onSourceSelected(filename: string) {
      this.resetSelectedFile = new Date().toISOString();
      this.$emit("displaySourceFile", { filename });
    },
    onFileSelected(k8sResourceName: string, file: string) {
      this.resetSelectedFile = new Date().toISOString();
      this.$emit("displayTemplateFile", { file, k8sResourceName });
    },
  },
};
</script>
