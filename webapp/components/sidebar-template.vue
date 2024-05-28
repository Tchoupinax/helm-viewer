<template>
  <div @click="showFiles = !showFiles" class="template flex items-center text-2xl cursor-pointer font-thin">
    <p>+</p>
    <p class="name">{{ name }}</p>
    <span class="text-xs font-bold ml-2 rounded-xl bg-cyan-100 p-1 px-2">{{ Object.keys(template).length }}</span>
  </div>

  <div
    v-if="showFiles"
    v-for="file of Object.keys(template)"
  >
    <p 
      class="ml-6 mt-2 flex cursor-pointer pl-2 hover:text-yellow-500 justify-between"
      @click="onFileSelected(file)"
    >
      <p>{{ file }}</p>
      <p v-if="file === selectedFile">
        🟢
      </p>
    </p>
  </div>
</template>

<script lang="ts">
export type Store = {
  showFiles: boolean;
  selectedFile: string;
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
    },
    reset: {
      type: String,
      required: true,
    },
  },
  watch: {
    reset: function() {
      this.selectedFile = "";
    }
  },
  data(): Store {
    return {
      showFiles: false,
      selectedFile: "",
    }
  },
  methods: {
    onFileSelected(file: string) {
      this.selectedFile = file;
      this.$emit('fileSelected', file)
    }
  }
}
</script>

<style>
.template:hover > .name {
  @apply underline;
}
</style>
