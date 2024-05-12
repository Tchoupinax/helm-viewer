<template>
  <div @click="showFiles = !showFiles" class="flex items-center text-2xl cursor-pointer hover:underline font-thin">
    <p>+ {{ name }}</p>
    <span class="text-xs font-bold ml-2 rounded-xl bg-cyan-100 p-1 px-2">{{ Object.keys(template).length }}</span>
  </div>

  <div
    v-if="showFiles"
    v-for="file of Object.keys(template)"
  >
    <p 
      class="ml-6 mt-2 flex cursor-pointer pl-2 hover:text-yellow-500"
      @click="$emit('fileSelected', file)"
    >
      {{ file }}
    </p>
  </div>
</template>

<script lang="ts">
export type Store = {
  showFiles: boolean;
};

export default {
  emits: ["fileSelected"],
  props: {
    name: {
      type: String,
      required: true,
    },
    template: {
      type: Object,
      required: true,
    }
  },
  data(): Store {
    return {
      showFiles: false,
    }
  },
}
</script>
