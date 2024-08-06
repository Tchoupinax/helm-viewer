<template>
  <div
    @click="onSelected"
    class="border-b-4 template flex items-center justify-between text-2xl cursor-pointer font-thin"
    :class="{
      'border-b-red-200': selected,
      'border-b-transparent hover:border-b-yellow-200': !selected,
    }"
  >
    <div class="flex">
      <p>+</p>
      <p class="name">{{ name }}</p>
    </div>
    <span class="text-xs font-bold ml-2 border bg-cyan-100 p-1 px-2">{{
      Object.keys(template).length
    }}</span>
  </div>

  <div v-if="showFiles" v-for="file of Object.keys(template)">
    <div
      class="ml-6 mt-2 flex cursor-pointer pl-2 hover:text-yellow-500 justify-between"
      @click="onFileSelected(file)"
    >
      <p>{{ file }}</p>
      <p v-if="file === selectedFile">🟢</p>
    </div>
  </div>
</template>

<script lang="ts">
export type Store = {
  selected: boolean;
  showFiles: boolean;
  selectedFile: string;
};

export default {
  emits: ["fileSelected", "selected"],
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
    resetSelectedFile: {
      type: String,
      required: true,
    },
  },
  watch: {
    reset: function () {
      this.selected = false;
    },
    resetSelectedFile: function () {
      this.selectedFile = "";
    },
  },
  data(): Store {
    return {
      selected: false,
      selectedFile: "",
      showFiles: false,
    };
  },
  methods: {
    onSelected(file: string) {
      this.$emit("selected", file);
      setTimeout(() => {
        this.selected = !this.selected;
        this.showFiles = !this.showFiles;
      }, 10);
    },
    onFileSelected(file: string) {
      this.$emit("fileSelected", file);
      setTimeout(() => {
        this.selectedFile = file;
      }, 10);
    },
  },
};
</script>

<style>
.template:hover > .name {
  @apply underline;
}
</style>
